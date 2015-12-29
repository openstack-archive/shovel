# Shovel(RackHD/OpenStack Coordinator)

## Description
Shovel is an application that provides a service with a set of APIs that wraps around RackHD/Ironic existing APIs allowing Users to find Baremetal Compute nodes dynamically  discovered by RackHD and register/unregister them with Ironic (OpenStack Bare Metal Provisioning Program).Shovel also Provides poller service that monitor compute nodes and log the error from SEL into Ironic Database.

This Code also provides a Shovel Horizon plugin that interface with Shovel service. The Plugin adds a new Panel to the admin Dashboard called rackhd that displays a table of all the Baremetal systems Discovered by RackHD. It also allow the user to see the node catalog in a nice table View, Register/Unregister node in ironic, Display node SEL and Enable/register a failover node.

## Instructions
-  Use [RackHD: Quick Setup](http://rackhd.readthedocs.org/en/latest/getting_started.html) to install  [RackHD](https://github.com/RackHD/RackHD).
- You can use Devstack to [Deploy Openstack](http://docs.openstack.org/developer/ironic/dev/dev-quickstart.html#deploying-ironic-with-devstack) to a single machine.
- Shovel-Horizon consists of two reposotories:
  - Service Application called [Shovel](https://github.com/keedya/Shovel-horizon/tree/master/Shovel), serves as [RackHD](https://github.com/RackHD/RackHD)/[Ironic](https://wiki.openstack.org/wiki/Ironic) coordinator (find Readme [Instructions](https://github.com/keedya/Shovel-horizon/blob/master/Shovel/README.md) to setup the service). 
  - [Shovel Horizon](https://github.com/keedya/Shovel-horizon/tree/master/Horizon) Plug-in (Follow [Instructions](https://github.com/keedya/Shovel-horizon/blob/master/Horizon/README.md) to Deploy plug-in to Horizon interface).

## Licencing

## Support
Please file bugs and issues at the GitHub issues page.
