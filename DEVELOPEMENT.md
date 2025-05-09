

require nodejs >=20 21<

# Arch linux + fish environement
## install fisher
```
curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher
```

## nvm fisher
```fisher install jorgebucaran/nvm.fish```

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

