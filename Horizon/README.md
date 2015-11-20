# OnRack plugin for OpenStack Horizon dashboard

On Shovel system:

- Set monorail:httpHost, ironic:httpHost and keystone:httpHost found in ./shovel/config.json

- Start shovel services: 

	cd ./shovel ; nodejs index.js

- On Horizon system:

	Set SHOVEL_URL in ./horizon-shovel/openstack_dashboard/dashboards/admin/hypervisors/baremetal/shovel.py

	Copy horizon-shovel contents to horizon:

		cp ./horizon-shovel/* /opt/stack/horizon

- Restart Apache:

	sudo service apache2 restart

- Enable OnRack event tasker:

	Install Celery:

		sudo pip install celery

	Start celery beat service:

		cd /opt/stack/horizon/ ; python manage.py celery worker -B -E

- Connect to Horizon dashboard URL and login

- Navigate to Admin -> System -> Hypervisors page

- Click on 'Bare Metal' tab


