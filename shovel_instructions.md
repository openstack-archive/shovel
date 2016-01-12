# RackHD/OpenStack Coordinator (shovel)

- git clone https://github.com/keedya/Shovel.git
- cd Shovel
- sudo mv Shovel /var/
- cd /var/Shovel
- sudo npm install --unsafe-perm
- sudo npm start
- Once the service is running, you can use swagger GUI to setup RackHD, Ironic, Keystone and Glance hostname and login information: http://<Shovel-IP>:9005/docs (You can also change Shovel Port(default:9005) note that the service will restart with the new configuration. 

## Shovel-Ironic Set info Example:

![alt text](https://github.com/keedya/shovel/blob/master/snapshot/ironic_info.png)

## Shovel Set Port Example:

![alt text](https://github.com/keedya/shovel/blob/master/snapshot/shovel_settings.png)

