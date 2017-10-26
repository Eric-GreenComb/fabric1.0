
## 第一步 启动 fabric 1.0 网络
sudo ./fabricNetStart.sh -d

## 第二步 启动 node express http server

### npm install
npm install

### install forever
sudo npm install forever -g

### start node express
PORT=4000 forever start app

forever stop app

## 第三步 初始化 fabric 1.0 channel等
./fabricInit.sh

## 第四步 运行测试数据
./fabricCreateObj.sh

./fabricQueryObj.sh

./fabricTest.sh 中的数据摘取

## 删除网络
sudo ./fabricNetRemove.sh


## 重新生成cr
- 删除
删除 crypto-config;genesis.block;mychannel.tx

删除 /tmp/fab*

删除 ~/.hfc-key-store

- cryptogen generate --config=./cryptogen.yaml

- configtxgen -profile TwoOrgsOrdererGenesis -outputBlock genesis.block

- export CHANNEL_NAME=mychannel

- configtxgen -profile TwoOrgsChannel -outputCreateChannelTx mychannel.tx -channelID $CHANNEL_NAME

- 修改docker-compose.yaml


