require nodejs >=20 21<

# Arch linux + fish environement

## install fisher

```
curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher
```

## nvm fisher

`fisher install jorgebucaran/nvm.fish`

## nodejs lts/iron

```
git clone https://github.com/electron-vite/electron-vite-vue.git Poe2LinuxCompanion


nvm install lts/iron
nvm use lts/iron

export npm_config_proxy=http://192.168.1.6:3128
export npm_config_https_proxy=http://192.168.1.6:3128

npm install -g pnpm

pnpm config set https-proxy http://192.168.1.6:3128
pnpm config set proxy http://192.168.1.6:3128
pnpm config list


pnpm install

pnpm approve-builds
#cocher les 2 cases

pnpm dev
```

# Lancer Code

```
nvm use lts/iron
code
```

# Communiquer par la socket

## depuis gnome ou kde

```sh
#Pricecheck
sh -c '/usr/bin/ydotool key -d 60 29:1 46:1 46:0 29:0 && sleep 0.1 && item=$(/usr/bin/wl-paste) && echo -e "pricecheck\n$item" | /usr/bin/socat - UNIX-CONNECT:/run/user/1000/poe2linuxcompanion.socket'

#Buyer 1 next action
sh -c 'echo "buyer1" | /usr/bin/socat - UNIX-CONNECT:/run/user/1000/poe2linuxcompanion.socket'
#Buyer 2 next action
sh -c 'echo "buyer2" | /usr/bin/socat - UNIX-CONNECT:/run/user/1000/poe2linuxcompanion.socket'
#Buyer 3 next action
sh -c 'echo "buyer3" | /usr/bin/socat - UNIX-CONNECT:/run/user/1000/poe2linuxcompanion.socket'
#Buyer 4 next action
sh -c 'echo "buyer4" | /usr/bin/socat - UNIX-CONNECT:/run/user/1000/poe2linuxcompanion.socket'

#Buyer wait
sh -c 'echo "buyer-wait" | /usr/bin/socat - UNIX-CONNECT:/run/user/1000/poe2linuxcompanion.socket'


```
