# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

from django.core.urlresolvers import reverse
from django.template import defaultfilters as filters
from django.utils.translation import pgettext_lazy
from django.utils.translation import ugettext_lazy as _
from django.utils.translation import ungettext_lazy

from horizon import tables
from horizon.utils import filters as utils_filters

from openstack_dashboard import api
from openstack_dashboard import policy

class RegisterSelectedNodes(tables.LinkAction):
    name = "register_selected"
    verbose_name = _("Register Selected")
    icon = "plus"
    classes = ("ajax-modal",)
    url = "horizon:admin:rackhd:register"
    def get_link_url(self, datum=None, *args, **kwargs):
        return reverse(self.url)


class UnregisterSelectedNodes(tables.LinkAction):
    name = "unregister_selected"
    verbose_name = _("Unegister Selected")
    icon = "minus"
    classes = ("ajax-modal",)
    url = "horizon:admin:rackhd:unregister"
    def get_link_url(self, datum=None, *args, **kwargs):
        return reverse(self.url)


class RegisterNode(tables.LinkAction):
    name = "register"
    verbose_name = _("Register")
    icon = "plus"
    classes = ("ajax-modal",)
    url = "horizon:admin:rackhd:register"


class Failover(tables.LinkAction):
    name = "failover"
    verbose_name = _("Failover")
    icon = "minus"
    classes = ("ajax-modal",)
    url = "horizon:admin:rackhd:failover"


class UnregisterNode(tables.LinkAction):
    name = "unregister"
    verbose_name = _("Unregister")
    icon = "minus"
    classes = ("ajax-modal",)
    url = "horizon:admin:rackhd:unregister"


class BareMetalFilterAction(tables.FilterAction):
    def filter(self, table, services, filter_string):
        q = filter_string.lower()
        return filter(lambda service: q in service.host.lower(), services)


class BareMetalDetailsTable(tables.DataTable):
    catalog = tables.Column("catalog", verbose_name=_("Node Catalog"), filters=[filters.safe])
    class Meta(object):
        name = "node_catalog"
        verbose_name = _("Catalog")


class BareMetalLastEventTable(tables.DataTable):
    date = tables.Column('date',verbose_name=_("Date"))
    event = tables.Column('event',verbose_name=_("Event"))
    logid = tables.Column('logid',verbose_name=_("Log ID"))
    sensor_num = tables.Column('sensor_num',verbose_name=_("Sensor Number"))
    sensor_type = tables.Column('sensor_type',verbose_name=_("Sensor Type"))
    time = tables.Column('time',verbose_name=_("Time"))
    value = tables.Column('value',verbose_name=_("Value"))
    class Meta(object):
        name = "lastevent"
        hidden_title=False
        verbose_name = _("Last Triggered")
        row_actions = (Failover,UnregisterNode,)


class BareMetalAllEventsTable(tables.DataTable):
    if False:
        date = tables.Column('date',verbose_name=_("Date"))
        event = tables.Column('event',verbose_name=_("Event"))
        logid = tables.Column('logid',verbose_name=_("Log ID"))
        sensor_num = tables.Column('sensor_num',verbose_name=_("Sensor Number"))
        sensor_type = tables.Column('sensor_type',verbose_name=_("Sensor Type"))
        time = tables.Column('time',verbose_name=_("Time"))
        value = tables.Column('value',verbose_name=_("Value"))
    else:
        html = tables.Column('html',verbose_name=_("System Events"), filters=[filters.safe])

    class Meta(object):
        name = "allevents"
        hidden_title=False
        verbose_name = _("All Events")


class BareMetalTable(tables.DataTable):
    name = tables.Column('name', verbose_name=_('Name'), link="horizon:admin:rackhd:detail", )
    uuid = tables.Column('uuid', verbose_name=_('Node ID') )
    hwaddr = tables.Column('hwaddr', verbose_name=_('MAC Address') )
    events = tables.Column('events', verbose_name=_('Events'), link="horizon:admin:rackhd:events" )
    state = tables.Column('state', verbose_name=_('State'))
    class Meta(object):
        name = "baremetal"
        verbose_name = _("Baremetal Compute Nodes")
        table_actions = (BareMetalFilterAction,)
        multi_select = False
        row_actions = (RegisterNode, UnregisterNode,)

