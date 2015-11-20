from django.utils.translation import ugettext_lazy as _
from openstack_dashboard.dashboards.admin.hypervisors.baremetal import shovel
from openstack_dashboard.api import nova
from horizon import exceptions
from horizon import messages

from celery.decorators import task
from datetime import timedelta

import re
import logging
import json

LOG = logging.getLogger(__name__)

def log_sel_all(sel):
    """ Simple SEL logger """
    for entry in sel:
        LOG.info(
            'logId:         {0}\n'
            'sensorType:    {1}\n'
            'sensorNumber:  {2}\n'
            'event:         {3}\n'
            'asserted:      {4}\n'
        .format(entry['logId'], 
                entry['sensorType'], 
                entry['sensorNumber'], 
                entry['event'], 
                entry['value']))
    return True


def log_sel_entry(entry):
    """ Simple SEL entry logger """
    LOG.info(
        'logId:         {0}\n'
        'sensorType:    {1}\n'
        'sensorNumber:  {2}\n'
        'event:         {3}\n'
        'asserted:      {4}\n'
    .format(entry['logId'], 
            entry['sensorType'], 
            entry['sensorNumber'], 
            entry['event'], 
            entry['value']))
    return True


def find_sel_entry_re(sel, regex):
    """ Return a list of searched regex expressions in each SEL entry """
    entry_list = []
    for entry in sel:
        if regex and regex.strip():
            match = re.search(r""+regex+"", json.dumps(entry, ensure_ascii=True))
            if match:
                entry_list.append(entry)
    return entry_list


def update_events(events, ecount, entry_list, uuid):
    """ Update the ironic nodes extra metadata with new event match """
    for entry in entry_list:
        # update the latest event
        if int(entry['time']) > int(events['time']):  
            LOG.info('update_event(): updating event for node {0} time:{1}'.format(uuid,entry['time']))
            ecount += 1
            p = json.loads( '[ {"path": "/extra/events", "value": ' + json.dumps(entry, ensure_ascii=True) + ', "op": "replace"}, {"path": "/extra/eventcnt", "value": ' + str(ecount) + ', "op": "replace"} ]' )
            shovel.node_patch(uuid, p)
    return True


@task()
def SELPoller():
    """ Periodic task to poll for monorail SEL events """
    nodes = shovel.get_ironic_nodes()
    for n in nodes['nodes']:
        extra = n['extra']
        nodeid = extra.get('nodeid', None)
        name = extra.get('name', None)
        events = extra.get('events', None)
        ecount = int(extra.get('eventcnt', 0))
        if nodeid is not None:
            failnode = extra.get('failover', None)
            regex = extra.get('eventre', None)
            if regex is not None:
                sel = shovel.get_current_sel_data(nodeid)[0].get('sel', None)
                if sel is not None:
                    update_events(events, ecount, find_sel_entry_re(sel, regex), n['uuid'])
    return True
                
      