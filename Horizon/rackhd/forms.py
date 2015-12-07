# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

import logging
from django.core.urlresolvers import reverse
from django.core.urlresolvers import reverse_lazy
from django.utils.translation import ugettext_lazy as _

from horizon import exceptions
from horizon import forms
from horizon import messages

from openstack_dashboard import api
from openstack_dashboard.dashboards.admin.rackhd import shovel

LOG = logging.getLogger(__name__)

class RegisterForm(forms.SelfHandlingForm):
    uuid = forms.Field(label=_('Node ID'), widget=forms.TextInput(attrs={'readonly':'readonly'}))
    name = forms.CharField(max_length=255, label=_('Name'), required=True)
    driver = forms.ChoiceField(label=_('Driver'), required=True, 
              widget=forms.Select(attrs={'class': 'switchable','data-slug': 'driver'}))
    kernel = forms.ChoiceField(label=_('Deploy Kernel'), required=True, 
              widget=forms.Select(attrs={'class': 'switchable'}))
    ramdisk = forms.ChoiceField(label=_('Deploy RAM Disk'), required=True, 
              widget=forms.Select(attrs={'class': 'switchable'}))
    port = forms.ChoiceField(label=_('Mac address'), required=True, 
              widget=forms.Select(attrs={'class': 'switchable'}))
    ipmihost = forms.CharField(required=False,
            widget=forms.TextInput(attrs={'class': 'switched','data-switch-on': 'driver','data-driver-pxe_ipmitool': _('IPMI Host Address')}))
    ipmiuser = forms.CharField(required=False,
            widget=forms.TextInput(attrs={'class': 'switched','data-switch-on': 'driver','data-driver-pxe_ipmitool': _('IPMI Username')}))
    ipmipass = forms.CharField(required=False, 
            widget=forms.PasswordInput(attrs={'class': 'switched','data-switch-on': 'driver','data-driver-pxe_ipmitool': _('IPMI Password')}))

    sshhost = forms.CharField(required=False,
            widget=forms.TextInput(attrs={'class': 'switched','data-switch-on': 'driver','data-driver-pxe_ssh': _('SSH Host Address')}))
    sshuser = forms.CharField(required=False,
            widget=forms.TextInput(attrs={'class': 'switched','data-switch-on': 'driver','data-driver-pxe_ssh': _('SSH Username')}))
    sshpass = forms.CharField(required=False,
            widget=forms.PasswordInput(attrs={'class': 'switched','data-switch-on': 'driver','data-driver-pxe_ssh': _('SSH Password')}))
    sshport = forms.CharField(required=False,
            widget=forms.TextInput(attrs={'class': 'switched','data-switch-on': 'driver','data-driver-pxe_ssh': _('SSH Port')}))

    failovernode = forms.ChoiceField(label=_("Failover Node"), required=False)
    enfailover = forms.BooleanField(label=_("Enable Failover"), initial=False, required=False)
    eventre = forms.CharField(max_length=255, label=_('Event Trigger (regex)'), required=False, initial='')

    def __init__(self, request, *args, **kwargs):
        super(RegisterForm, self).__init__(request, *args, **kwargs)
        self._node = kwargs['initial'].get('node', None)
        if self._node is not None:
            self._drivers = kwargs['initial']['drivers']
            self._ramdisk = kwargs['initial']['images']
            self._macaddress = kwargs['initial']['ports']
            self.fields['name'].initial = shovel.get_catalog_data_by_source(self._node['id'],'dmi')['System Information']['Product Name']
            self.fields['uuid'].initial = self._node['id']
            self.fields['driver'].choices = [ (elem,_(elem)) for elem in self._drivers ]
            self.fields['kernel'].choices = [ (elem,_(elem)) for elem in self._ramdisk ]
            self.fields['ramdisk'].choices = [ (elem,_(elem)) for elem in self._ramdisk ]
            self.fields['port'].choices = [ (elem,_(elem)) for elem in self._macaddress]      
            # BMC information initials
            bmc = shovel.get_catalog_data_by_source(self._node['id'], 'bmc')
            bmcuser = shovel.get_catalog_data_by_source(self._node['id'], 'ipmi-user-list-1')
            self.fields['ipmihost'].initial = bmc['IP Address']
            self.fields['ipmiuser'].initial = bmcuser['2']['']
            
            # Host network initials
            host = shovel.get_catalog_data_by_source(self._node['id'], 'ohai')
            self.fields['sshuser'].initial = host['current_user']
            self.fields['sshhost'].initial = host['ipaddress']
            self.fields['sshport'].initial = '22'

            # Failover node initials
            nodes = shovel.request_nodes_get()
            self.fields['failovernode'].choices = [ (n['id'],_(n['id'])) for n in nodes if n['id'] != self._node['id'] ]
        else:
            redirect = reverse('horizon:admin:rackhd:index')
            msg = 'Invalid node ID specified'
            messages.error(request, _(msg))
            raise ValueError(msg) 

    def _add_new_node(self, request, data):
        try:
            # create node with shovel
            #replace kernal and ramdisk with image id
            list_images = shovel.get_images_list()['images']
            for elem in list_images:
                if data['ramdisk'] == elem['name']:
                    data['ramdisk'] = elem['id']
                if data['kernel'] == elem['name']:
                    data['kernel'] = elem['id']
            result = shovel.register_node_post(data)
            if 'error_message' in result:
                raise Exception(result) 
            else:
                msg = _('Registered node {0} ({1})'.format(data['uuid'], data['name']))
                messages.success(request, msg)
                return True
        except Exception:
            redirect = reverse('horizon:admin:rackhd:index')
            msg = _('Failed to register baremetal node: {0} ({1})'.format(data['uuid'], data['name']))
            messages.error(request, msg)
            return False

    def _check_failover(self, data):
        if not data['enfailover']:
            data.pop('failovernode', None)

    def handle(self, request, data):
        self._check_failover(data)
        self._add_new_node(request, data)
        return True


class UnregisterForm(forms.SelfHandlingForm):
    uuid = forms.CharField(max_length=255, label=_("Unregister Node"))
    
    def __init__(self, request, *args, **kwargs):
        super(UnregisterForm, self).__init__(request, *args, **kwargs)
        self._node = kwargs['initial']['node']
        self.fields['uuid'].initial = self._node['id']     

    def _remove_current_node(self, request, data):
        try:            
            # unregister a node from ironic using shovel
            result = shovel.unregister_node_del(data['uuid'])
            if 'result' in result:
                msg = _('Unregistered node {0}'.format(data['uuid']))
                messages.success(request, msg)
                return True              
            else:
                raise Exception(result) 
        except Exception:
            redirect = reverse('horizon:admin:rackhd:index')
            msg = _('Failed to unregister baremetal node: {0}'.format(data['uuid']))
            messages.error(request, msg)
            return False

    def handle(self, request, data):
        self._remove_current_node(request, data)
        return True

