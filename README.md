# plausible Destination for Jitsu

Plausible destination plugin for [Jitsu](https://jitsu.com)
based on [Jitsu SDK](https://github.com/jitsucom/jitsu-sdk).

## Using

Install all dependencies for a project
```shell
yarn install
```

Build destination
```shell
yarn build
```

Run tests
```shell
yarn test
```

If everything is ok - resulted destination file location
```shell
./dist/plausible-destination.js
```

Validate destination config:
with json string:
```shell
yarn validate-config --config-object '{"api_secret": "abc","token": "def", "project_id": "123"}'
```
with json file:
```shell
yarn validate-config --config config.json
```

## Developers  

### Setup with CentOS
docker ps
yum install epel-release
yum install dnf
npm i -g corepack
sudo dnf install nodejs
sudo dnf install npm
npm install -g npx
npx jitsu-cli@0.7.5 extension create --type destination
'''
  Need to install the following packages:
    jitsu-cli@0.7.5
  Ok to proceed? (y) y
  ? Please, provide project name: jitsu-plausible
  ? Project directory: /root/application/jitsu-plausible
  [info ] - Creating new jitsu project in /root/application/jitsu-plausible
  [info ] - Project directory doesn't exist, creating it!
  [info ] - ✨ Done
'''

### Settings the plugin with Jitsu server (dev)

```shell
cd /root/application/my-plugins/
tar -C /root/application/my-plugins/jitsu-plausible/ -cvzf jitsu-plausible-destination.tgz .
mv jitsu-plausible-destination.tgz /root/application/my-plugins/jitsu-plausible/
```

add this line to "volumes:" section
```shell
nano docker/eventnative.yaml
[...]
destinations:
  jitsu-plausible-destination:
    only_tokens:
      - my_token
    type: npm
    package: /home/eventnative/data/plugins/jitsu-plausible/jitsu-plausible-destination.tgz
    mode: stream
    config:
      api_secret: "https://hooks.slack.com/services/ABC/XYZ/etc"
      token: "registration,error"
      project_id: "123"
```

```
nano docker-compose.yaml
- /root/application/my-plugins/:/home/eventnative/data/plugins/
- /root/application/docker/eventnative.yaml:/home/eventnative/data/config/eventnative.yaml
```

### testing
```bash
yarn build && yarn validate-config -c config.json
```
