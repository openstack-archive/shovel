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
import json
import pprint 

from django.core.urlresolvers import reverse
from django.core.urlresolvers import reverse_lazy
from django.utils.translation import ugettext_lazy as _

from horizon import exceptions
from horizon import forms
from horizon import tables
from horizon import messages

from openstack_dashboard import api

from openstack_dashboard.dashboards.admin.rackhd \
    import forms as baremetal_forms
from openstack_dashboard.dashboards.admin.rackhd \
    import tables as baremetal_tables
    
from openstack_dashboard.dashboards.admin.rackhd \
    import json2html as j2h

from openstack_dashboard.dashboards.admin.rackhd import shovel

LOG = logging.getLogger(__name__)

class IndexView(tables.DataTableView):
    # A very simple class-based view...
    table_class = baremetal_tables.BareMetalTable
    template_name = "admin/rackhd/index.html"
    page_title = _("Baremetal")

    class NodeData:
        def __init__(self, uuid, name, hwaddr, events, state):
            self.id = uuid
            self.name = name
            self.uuid = uuid
            self.hwaddr = hwaddr
            self.events = events
            self.state = state

    def get_data(self):
        data = []
        try:
            nodes = shovel.request_nodes_get()
            i = 0
            for n in nodes:
                dmi = shovel.get_catalog_data_by_source(n['id'],'dmi')
                name = dmi['System Information']['Product Name']
                hwaddr = n['name'] 
                id = n['id']
                events = '0'
                n = self._find_ironic_node(id)
                if n is not None:
                    events = n['extra'].get('eventcnt','0')
                    state = 'Registered'
                else:
                    state = 'Unregistered'
                i += i +1
                data.append(self.NodeData(id, name, hwaddr, events, state))
            return data
        except  Exception, e:
            print 
            LOG.error("Excepton in get_baremetal_data():  {0}".format(e))
            return data
    def _find_ironic_node(self, id):
        # ISSUE: iterating all nodes because query by name (onrack id) isn't working in ironic?
        nodes = shovel.get_ironic_nodes()
        for n in nodes['nodes']:
            if n['extra'].get('nodeid', None) == id:
                return n
        return None

class RegisterView(forms.ModalFormView):
    context_object_name = 'baremetal'
    template_name = 'admin/rackhd/register.html'
    form_class = baremetal_forms.RegisterForm
    success_url = reverse_lazy('horizon:admin:rackhd:index')
    page_title = _("Register Node")

    def get_context_data(self, **kwargs):
        context = super(RegisterView, self).get_context_data(**kwargs)
        context["baremetal"] = self.kwargs['baremetal']
        return context

    def get_initial(self):
        id = self.kwargs['baremetal']
        node = shovel.request_node_get(id)
        list_drivers = shovel.get_driver_list()['drivers']
        drivers = [ elem['name'] for elem in list_drivers ]
        ports = str(node['name']).split(',')

        list_images = shovel.get_images_list()['images']
        images = [ elem['name'] for elem in list_images ]
        initial = super(RegisterView, self).get_initial()
        initial.update({'nodeid': self.kwargs['baremetal'], 'node': node, 'drivers': drivers,'images':images,'ports': ports})
        return initial


class UnregisterView(forms.ModalFormView):
    context_object_name = 'baremetal'
    template_name = 'admin/rackhd/unregister.html'
    form_class = baremetal_forms.UnregisterForm
    success_url = reverse_lazy('horizon:admin:rackhd:index')
    page_title = _("Unegister Node")

    def get_context_data(self, **kwargs):
        context = super(UnregisterView, self).get_context_data(**kwargs)
        context["baremetal"] = self.kwargs['baremetal']
        return context

    def get_initial(self):
        id = self.kwargs['baremetal']
        node = shovel.request_node_get(id)
        initial = super(UnregisterView, self).get_initial()
        initial.update({'nodeid': self.kwargs['baremetal'], 'node': node})
        return initial


class FailoverView(forms.ModalFormView):
    context_object_name = 'baremetal'
    template_name = 'admin/rackhd/register.html'
    form_class = baremetal_forms.RegisterForm
    success_url = reverse_lazy('horizon:admin:rackhd:index')
    page_title = _("Failover")

    def _find_ironic_node(self, id):
        nodes = shovel.get_ironic_nodes()
        for n in nodes['nodes']:
            if n['extra'].get('nodeid', None) == id:
                return n

    def _remove_node(self,id):
        try:            
            result = shovel.unregister_node_del(id)
            return True
        except Exception:
            redirect = reverse('horizon:admin:rackhd:index')
            return False

    def get_context_data(self, **kwargs):
        context = super(FailoverView, self).get_context_data(**kwargs)
        context["baremetal"] = self.kwargs['baremetal']
        return context

    def get_initial(self):
        initial = super(FailoverView, self).get_initial()
        current_id = self.kwargs['baremetal']
        inode = self._find_ironic_node(current_id)
        try:
            if inode is not None:
                failover = inode['extra'].get('failover', None)
                if failover is not None:
                    node = shovel.request_node_get(failover)
                    list_drivers = shovel.get_driver_list()['drivers']
                    drivers = [ elem['name'] for elem in list_drivers ]
                    initial.update({'nodeid': self.kwargs['baremetal'], 'node': node, 'drivers': drivers}) 
                else:
                    raise ValueError('Failover node not set') 
            else:
                raise ValueError('Registered node not found') 
        except ValueError as e:
            redirect = reverse('horizon:admin:rackhd:index')
            messages.error(self.request, _(e.message))
            raise Exception(e.message)    
        self._remove_node(current_id)
        messages.success(self.request, _('Removed node {0}'.format(current_id)))
        return initial


class BareMetalDetailView(tables.DataTableView):
    table_class = baremetal_tables.BareMetalDetailsTable
    template_name = 'admin/rackhd/detail.html'
    page_title = _('Details')
    
    class CatalogData:
        def __init__(self, id, catalog):
            self.id = id
            self.catalog = catalog
        
    def get_data(self):
        uuid = self.kwargs['baremetal']
        dmi = shovel.get_catalog_data_by_source(id = uuid, source = 'dmi')
        scsi = shovel.get_catalog_data_by_source(id = uuid, source = 'lsscsi')
        del dmi['Processor Information'] # don't feel like rendering this now
        dmi.update({'Storage Information' : scsi})
        
        catalog = json.dumps(dmi, sort_keys=True, indent=4, separators=(',', ': '))
        data = [ self.CatalogData(id, j2h.json2html.convert( json = catalog, table_attributes="class=\"table-bordered table\"" )) ]
        return data


class BareMetalEventView(tables.MultiTableView):
    table_classes = (baremetal_tables.BareMetalLastEventTable, 
                     baremetal_tables.BareMetalAllEventsTable,)
    template_name = 'admin/rackhd/events.html'
    page_title = _('Events')
    name = _("Events")
    slug = "events"

    class HTMLData:
        def __init__(self, id, html):
            self.id = id
            self.html = html

    class SELEventData:
        def __init__(self, id, type, value, logid, number, time, date, event):
            self.id = id
            self.date = date
            self.event = event
            self.logid = logid
            self.sensor_num = number
            self.sensor_type = type
            self.time = time
            self.value = value
    
    def _find_ironic_node(self, id):
        nodes = shovel.get_ironic_nodes()
        for n in nodes['nodes']:
            if n['extra'].get('nodeid', None) == id:
                return n

    def get_lastevent_data(self):
        id = self.kwargs['baremetal']
        try:
            node = self._find_ironic_node(id)
            if node is not None:
                entry = node['extra']['events']
                return [ self.SELEventData(id,
                    entry['sensorType'],
                    entry['value'], 
                    str(int(entry['logId'], 16)), 
                    entry['sensorNumber'],
                    entry['time'],
                    entry['date'],
                    entry['event']) ]
        except:
            pass
        return []

    def get_allevents_data(self):
        id = self.kwargs['baremetal']
        try:      
            sel = shovel.get_current_sel_data(id)[0].get('sel', [])
        except KeyError as e:
            redirect = reverse('horizon:admin:rackhd:index')
            messages.error(self.request, _('No SEL data available, check node {0} poller task'.format(id)))
            raise KeyError(e.message)
        data = []
        if False: # TODO: enable this, view is not iterating the data list correctly
            for entry in sel:
                data.append(self.SELEventData(id,
                            entry['sensorType'],
                            entry['value'], 
                            str(int(entry['logId'], 16)), 
                            entry['sensorNumber'],
                            entry['time'],
                            entry['date'],
                            entry['event'] ))
        else: # build html
            rsel = list(reversed(sel))
            j = json.dumps({"":rsel}, sort_keys=True, indent=4, separators=(',', ': '))
            return [ self.HTMLData(id, j2h.json2html.convert(json=j, table_attributes="class=\"table\"")) ]
        return data