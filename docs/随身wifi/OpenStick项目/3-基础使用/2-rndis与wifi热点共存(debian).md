# rndis与wifi热点共存(debian)

## 解决debian rndis与wifi热点共存的问题

- 感谢 lilyok123 (酷安 @lilyok123) 的投稿
- 原理：创建一个网桥，配置ip地址，并且将usb网卡与无线网卡设备加入到网桥中即可
- 注意事项：建议操作前将wifi连接到路由器上，操作时先将usb网络加入到网桥中，确保电脑能够正常 连接后，再将无线网卡加入到网桥中，万一操作失误还能从其它的网卡登录设备。否则估计得重新刷机了。

### 具体步骤

- 第一步，输入命令nmtui，创建一个网桥  
    ![](https://img.kancloud.cn/e5/89/e58989aa55342279ebb648b97e30b887_876x883.png)
- 第二步,配置ip地址为192.168.68.1/24（大佬默认是这个地址，如果更改网段需要修改dnsmsq.conf文件），配置名随意，设备名随意，这里都写br0  
    ![](https://img.kancloud.cn/c2/9e/c29e3e23dd14fdf931ff48f3551833fa_894x896.png)
- 第三步，为网桥添加一个ETHERNET设备  
    ![](https://img.kancloud.cn/cf/45/cf45c87b78c8a20f9572a3c9e4872b33_869x904.png)
- 第四步，ethernet设备需要填写为usb0（ifconfig命令看到的网卡名），配置名随意，这里起个名也是usb0  
    ![](https://img.kancloud.cn/9e/d2/9ed2dd3a88c34b56e055341217565393_856x893.png)
- 第五步，此时usb0的设备添加成功，保存退出  
    ![](https://img.kancloud.cn/bf/2b/bf2b0b6de73d834fbafe72a01d618d15_865x889.png)
- 第六步，此时usb0配置文件如果没有生效，需要nmcli connection手动激活下，如无意外此时电脑能够正常访问随身wifi了。如果不成功通过另外的无线网卡登录看看配置是不是正确。  
    ![](https://img.kancloud.cn/c9/c6/c9c6dcc3cbef34448b18a586ea0e876c_1300x450.png)
- 第七步，在第六步usb0的网桥确保正常后，可以为网桥添加无线网卡了，输入nmtui命令，选择刚刚的br0配置文件，选择edit编辑。  
    ![](https://img.kancloud.cn/88/d8/88d8939308f6d96425c2db6e385ef17d_828x916.png)
- 第八步，选择添加WLAN无线设备  
    ![](https://img.kancloud.cn/0b/40/0b405ed8eb89d81db2925cd909e597b9_848x865.png)
- 第九步，配置热点的名称，密码等参数，配置文件随意，device需要添加ifconfig中的无线网卡名称。  
    ![](https://img.kancloud.cn/6c/75/6c75bd45d231d3c82ecbbad931c47d63_879x841.png)
- 第十步，保存配置，返回  
    ![](https://img.kancloud.cn/b8/be/b8be46f51d17ae4a471114fb8a7cfb99_840x872.png)
- 最后一步，此时wlan0的配置文件没有生效，需要手动nncli connection切换下。
- ![](https://img.kancloud.cn/43/a0/43a0545308bb581f5227428499baa8e0_1200x587.png)