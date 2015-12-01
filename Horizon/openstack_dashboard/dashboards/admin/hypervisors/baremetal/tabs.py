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
import logging
import json
import requests

from django.utils.translation import ugettext_lazy as _

from horizon import exceptions
from horizon import tabs

import openstack_dashboard.api
from openstack_dashboard.dashboards.admin.hypervisors.baremetal import tables
from openstack_dashboard.dashboards.admin.hypervisors.baremetal import shovel

LOG = logging.getLogger(__name__)

class OnRackTab(tabs.TableTab):
    table_classes = (tables.BareMetalTable,)
    name = _("Bare Metal")
    slug = "baremetal"
    template_name = "horizon/common/_data_table.html"

    class NodeData:
        def __init__(self, uuid, name, hwaddr, events, state):
            self.id = uuid
            self.name = name
            self.uuid = uuid
            self.hwaddr = hwaddr
            self.events = events
            self.state = state

    def _find_ironic_node(self, id):
        # ISSUE: iterating all nodes because query by name (onrack id) isn't working in ironic?
        nodes = shovel.get_ironic_nodes()
        for n in nodes['nodes']:
            if n['extra'].get('nodeid', None) == id:
                return n
        return None

    def get_baremetal_data(self):
        data = []
        try:
            nodes = shovel.request_nodes_get()
            for n in nodes:
                if n['type'] == 'enclosure':
                    continue
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
                data.append(self.NodeData(id, name, hwaddr, events, state))
            return data
        except  Exception, e:
            LOG.error("Excepton in get_baremetal_data():  {0}".format(e))
            return data
