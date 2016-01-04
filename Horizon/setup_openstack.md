# Configure Openstack to Boot Baremetal nodes Using Devstack

## Download and install OpenStack using DevStack
- git clone https://github.com/openstack-dev/devstack.git devstack
- sudo ./devstack/tools/create-stack-user.sh
- sudo su stack
- cd ~
- git clone https://github.com/openstack-dev/devstack.git devstack
- cd Devstack
- in Devstack, Create local.conf :
  ```python
  
  [[local|localrc]]
  #Enable Ironic API and Ironic Conductor
  enable_service ironic
  enable_service ir-api
  enable_service ir-cond
  #Enable Neutron which is required by Ironic and disable nova-network.
  disable_service n-net
  disable_service n-novnc
  enable_service q-dhcp
  enable_service q-svc
  enable_service q-agt
  enable_service q-l3
  enable_service q-meta
  enable_service neutron
  #Optional, to enable tempest configuration as part of devstack
  disable_service tempest
  disable_service heat h-api h-api-cfn h-api-cw h-eng
  disable_service cinder c-sch c-api c-vol
  ADMIN_PASSWORD=root
  DATABASE_PASSWORD=$ADMIN_PASSWORD
  RABBIT_PASSWORD=$ADMIN_PASSWORD
  SERVICE_PASSWORD=$ADMIN_PASSWORD
  SERVICE_TOKEN=$ADMIN_PASSWORD
  HOST_IP=172.31.128.7
  #Create 3 virtual machines to pose as Ironic's baremetal nodes.
  IRONIC_VM_COUNT=3
  IRONIC_VM_SSH_PORT=22
  IRONIC_BAREMETAL_BASIC_OPS=True
  #The parameters below represent the minimum possible values to create
  #functional nodes.
  IRONIC_VM_SPECS_RAM=1024
  IRONIC_VM_SPECS_DISK=10
  #Size of the ephemeral partition in GB. Use 0 for no ephemeral partition.
  IRONIC_VM_EPHEMERAL_DISK=0
  VIRT_DRIVER=ironic
  #By default, DevStack creates a 10.0.0.0/24 network for instances.
  #If this overlaps with the hosts network, you may adjust with the
  #following.
  NETWORK_GATEWAY=10.1.0.1
  FIXED_RANGE=10.1.0.0/24
  FIXED_NETWORK_SIZE=256
  #Neutron OVS (flat)
  Q_PLUGIN=ml2
  Q_AGENT_EXTRA_OVS_OPTS=(network_vlan_ranges=physnet1)
  OVS_VLAN_RANGE=physnet1
  PHYSICAL_NETWORK=physnet1
  OVS_PHYSICAL_BRIDGE=br-eth2
  #Log all output to files
  LOGFILE=$HOME/devstack.log
  SCREEN_LOGDIR=$HOME/logs
  IRONIC_VM_LOG_DIR=$HOME/ironic-bm-logs
  ```
- Configure network Interface (assuming port eth2 is used to connect openstack to rackHD)
 
![alt text](https://github.com/keedya/Shovel-horizon/blob/master/Shovel/snapshot/dev_config.PNG)

- cat>>/etc/network/interfaces
  ```python
  
  auto eth2
  iface eth2 inet static
  address 172.31.128.7
  netmask 255.255.255.0
  ```
- Restart network service 
   - sudo ifdown eth2
   - sudo ifup eth2
-  Run ./stack.sh

## Configure Neutron

Once the installation is completed, an external bridge can be setup for Neutron physical network

- Bind eth2 to the external bridge:
 - ovs-vsctl add-port br-eth2 eth2
- Enable external network access under nested Open vSwitch
 - ifconfig br-eth2 promisc up
- Update external bridge configuration cat>>/etc/network/interfaces
  ```python
  
  auto eth2
  iface eth2 inet manual
  auto br-eth2
  iface br-eth2 inet static
  address 172.31.128.7
  netmask 255.255.255.0
  ```
- Restart network service 
   - sudo ifdown br-eth2
   - sudo ifup br-eth2

- Create Flat netwok:
  - Source ~/devstack/openrc admin admin
  - neutron net-create flat-provider-network --shared --provider:network_type flat --  provider:physical_network physnet1
  - neutron subnet-create --name flat-provider-subnet --gateway 172.31.128.7 --dns-nameserver 172.31.128.254 --allocation-pool start=172.31.128.100,end=172.31.128.150 flat-provider-network 172.31.128.0/24

## Spawn an instance using nova service
- Login the horizon interface (user:admin,password:root)
- Use horizon to create new instances


  
  
