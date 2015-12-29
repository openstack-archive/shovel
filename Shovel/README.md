# RackHD/OpenStack Coordinator (shovel)

- git clone https://github.com/keedya/Shovel-horizon.git
- cd Shovel-horizon
- sudo mv Shovel /var/
- cd /var/Shovel
- sudo npm install --unsafe-perm
- sudo npm start
- Once the service is running, you can use swagger GUI to setup RackHD, Ironic, Keystone and Glance hostname and login information: http://<Shovel-IP>:9005/docs (You can also change Shovel Port(default:9005) note that the service will restart with the new configuration

