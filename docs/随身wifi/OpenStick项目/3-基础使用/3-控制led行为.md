# 控制led行为

OpenStick 存在三个led灯，默认blue表示wifi连接状态，red表示系统是否还处于正常运行状态。

可以通过 **echo <行为> > /sys/class/led/<名字>/trigger** 来修改led行为。  
可用的行为如下

```
root@openstick:/sys/class/leds/green:internet# cat trigger 
[none] usb-gadget usb-host rfkill-any rfkill-none kbd-scrolllock kbd-numlock kbd-capslock kbd-kanalock kbd-shiftlock kbd-altgrlock kbd-ctrllock kbd-altlock kbd-shiftllock kbd-shiftrlock kbd-ctrlllock kbd-ctrlrlock timer heartbeat cpu cpu0 cpu1 cpu2 cpu3 default-on panic mmc0 bluetooth-power hci0-power rfkill0 phy0rx phy0tx phy0assoc phy0radio rfkill1
```

例如把green led的行为定义为usb device模式的活动状态

```
root@openstick:/sys/class/leds/green:internet# echo usb-gadget > trigger
```

写入该字符串后led行为立刻生效，重启失效