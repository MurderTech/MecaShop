# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  config.vm.box = "mecashop"
  config.vm.network "forwarded_port", guest: 2525, host: 2525
  config.vm.network "forwarded_port", guest: 27017, host: 27017
  config.vm.provider "virtualbox" do |vb|

     # Customize the amount of memory on the VM:
    vb.memory = "1024"
  end
  config.vm.provision "shell", inline: <<-SHELL
    # Installing node
    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    apt-get install -y nodejs
    # Installing nodemon
    sudo npm i nodemon -g
    # Stopping any started container
    docker stop $(docker ps -a -q)
  SHELL
end
