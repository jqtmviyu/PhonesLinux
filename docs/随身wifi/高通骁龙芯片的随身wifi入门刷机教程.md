# 高通骁龙芯片的随身wifi入门刷机教程

作者: 酷安 伏莱兮浜  
https://www.coolapk.com/feed/37834896?shareKey=YmY4MTRiOWNiOWMzNjUzMTIzNjU~

> 本教程主要面向001系列（包括003和903等）的随身wifi（以下简称板子），这些型号在本版块俗称"纸盒/芷荷"系，它们的元器件布局基本相同，如下图，不少文件通刷。其它410板子比如uz801，16-v3等可以参考此教程，理论方法一样，但不适用于中兴，华为，联发科，展讯等芯片的随身WiFi。

## 纸盒系外观

![](https://img.hellohxx.top/202403031723956.jpg)

## 注意事项

如果需要刷openwrt和Debian，只有纸盒系和类纸盒的uz801 sp970，其它型号不能刷。

简单说几个常见问题：SIM卡要插对，天线别弄掉了，板子所处位置的信号不能太差，台式电脑建议用后面主板的USB口，有些电脑前置USB口容易供电不足，很多软件问题可以重启或者更换电脑就能解决，刷机前最好先备份，遇到其它问题看我另一个动态。  

拿到板子后插卡确认能否识别sim卡以及数据wifi功能是否正常，然后撬开外壳确定自己的板子是什么型号。下面开始刷机前后的工作了，需要用到的工具文件在此下载

[[链接]123云盘](https://www.123pan.com/s/F7vrVv-jK75d)  提取码:OncH  

本教程有错误的地方欢迎指正。  
  

## 准备工作  

工具文件可能被系统报毒删除，所以以win10为例，建议新建一个随身WiFi文件夹，然后在Windows安全中心—病毒和威胁防护—病毒威胁防护设置—管理设置—排除项—添加排除项，把文件夹添加进去，然后把刷机文件下载到这里，就不会被系统删除了，其它杀毒软件也可以类似这样设置。

![](https://img.hellohxx.top/202403031723498.jpg)

防止杀毒软件删除文件

## 安装驱动

高通板子刷机需要安装9008驱动和adb驱动，打开并安装文件里的9008driver

![](https://img.hellohxx.top/202403031723123.jpg)

## 关于adb的使用

（本文所有用到的adb命令在文件夹文本里都有），adb全称Android debug bridge，后面很多用到的工具都集成了它，所以换到不同工具时可能会出现adb冲突，这时需要在任务管理器中停掉adb/Android debug bridge程序，后面我会提醒，虽然很多工具都集成了adb，但我还是提供了一份谷歌官方的adb工具。

### 打开ADB工具

打开ADB文件夹到最后，点击地址栏末尾空白，输入cmd再回车就出现命令行界面

![](https://img.hellohxx.top/202403031723921.jpg)

### 查看adb是否正常

把板子插上电脑，等待板子完全开机后，输入命令：adb devices  
如果显示有设备连接就说明adb正常（有些板子adb功能没有打开，可以在本版块搜索开启方法）。

![](https://img.hellohxx.top/202403031724585.jpg)

### 进入9008模式

两种方法进入9008模式：可以输入命令进：adb reboot edl  
或者按住板子的恢复键，插入电脑一两秒后听到叮咚一声再松手。在设备管理器里看到端口有9008就表示成功了，需要9008刷机时再开启此端口。

![](https://img.hellohxx.top/202403031724501.jpg)

## 备份/救砖

这一步非常重要！不建议新玩家拿到板子后直接刷别人的rom包，而是应该先备份好自己的rom，之后随便刷，只要硬件没坏都能救活。如果自己的板子系统是阉割版的，比如没有热点和网络共享等，可以刷一下别人的system包，其它情况不太需要刷别人的文件。备份主要有三个过程：  
  

### Miko loader(全量包)

#### 备份

找到miko文件夹，双击miko安装，直接默认就行了，记住安装路径，安装完成后把文件夹内的loader复制到miko的安装目录，创建loader的快捷方式到桌面

![](https://img.hellohxx.top/202403031728506.jpg)

复制loader并创建快捷方式

让板子进入9008模式，打开loader，按照图片数字顺序一步步来

![](https://img.hellohxx.top/202403031727138.jpg)

#### 救砖

点read，partition backup，双击下面double click to open save folder，选好救砖包生成的路径，点load partition structure，点read full image就能制作刷机救砖包，大概5分钟以内，保存好这个名为.bin的单文件。  
刷机/救砖方法图片也标注了顺序，分别点flash，emmc block0 flasher，double click.....，flash！

![](https://img.hellohxx.top/202403031727404.jpg)

### Qualcomm Premium Tool(单独分区)

#### 注册机生成key

用Qualcomm Premium Tool 备份全部分区文件，打开它的文件夹，有个提示先注册的程序，注意要把电脑音量调低！然后点开它后可能会提示安装一些东西，同意就行了，没有的话不用管，弹出窗口点击Generate Key，生成的key放在你知道的文件夹内

![](https://img.hellohxx.top/202403031727673.jpg)

#### 激活工具

打开Qualcomm Premium Tool程序，左上菜单栏找到help—active，选择刚才生成的key就能激活这个软件了

![](https://img.hellohxx.top/202403031727561.jpg)


按照前面介绍的方法使板子进入9008模式，在Qualcomm Premium Tool按照图片数字一步一步进行

![](https://img.hellohxx.top/202403031724648.jpg)

#### 备份步骤顺序

找qualcomm和partition，在下面点scan，Do job，它会识别显示板子的内部分区，点backup（正常会自动跳到这一项），右边backup all，最后do job，等待就行了，备份的文件保存好，里面的有些文件后面会用到。  
如果需要刷写某些分区，点击scan识别分区后，点write，再选要刷的分区，点Do job后选择分区文件，就能完成刷写该分区。  
  

### 备份qcn和root

需要先进行root，简单点的办法就是安装magisk，再刷一下修补过的boot文件就有root了。当然我更建议自己修补boot，不用等别人做好，出问题的概率也更小。下面是如何自己动手获得root权限：

#### 安装ardc

这是一个投屏软件，解决板子没有屏幕无法操作的问题，它的操作逻辑是鼠标左键为点击功能，右键为返回。安装完ardc后先别打开，检查一下任务管理器中，有adb或者android debug bridge程序在后台的话记得停掉，再把板子插到电脑上正常启动，打开ardc等待画面变化，成功后会停在深蓝色界面，然后把鼠标箭头移到此界面，右键点击两下，如果没有出现桌面，需要安装一个第三方桌面启动器，把我提供的apk文件里的launcher从电脑直接托到ardc界面就会自动给板子安装

![](https://img.hellohxx.top/202403031724014.jpg)

#### 安装桌面启动器

等五秒后在主界面点一下鼠标右键，应该会出现选择主屏幕应用选择，点launcher和始终

![](https://img.hellohxx.top/202403031724626.jpg)

选择默认桌面启动器

#### magisk

然后就能看到板子的系统界面了，接着安装es文件管理器和magisk，也是直接拖到ardc界面自动安装，装好后点开文件管理器，进入下载文件夹

![](https://img.hellohxx.top/202403031724258.jpg)

把之前Qualcomm备份的boot文件直接托到这里，就会复制过来了（几秒钟，点下面的刷新就会显示出来）

![](https://img.hellohxx.top/202403031725629.jpg)

复制boot文件到板子

退出es，点开magisk，找到图片提示的位置

![](https://img.hellohxx.top/202403031725013.jpg)

magisk修补boot

安装>下一步>选择并修补一个文件，选择刚才复制过来的boot，然后开始，等待它修补完成，退出并来到es文件管理器，进入下载，发现修补好的boot文件名太长了，长按后重命名为magiskboot.img  
再点击ardc菜单最后一个>>; 弹出的cmd这里（实际就是这个软件也集成了adb功能，这里直接使用它的）

![](https://img.hellohxx.top/202403031725879.jpg)

打开ARDC的ADB功能

输入命令：adb pull /sdcard/Download/magiskboot.img D:/xxx  
这里D:/xxx换成你自己的路径（斜杠朝左还是朝右都可以），接着按回车就会把magiskboot.img导出到你的电脑上

![](https://img.hellohxx.top/202403031727362.jpg)

导出magiskboot

再输入命令：adb reboot bootloader  
板子会重启到fastboot模式，然后输入命令：fastboot flash boot后再按个空格键，接着把电脑上magiskboot.img拖到这里，会自动生成文件路径名

![](https://img.hellohxx.top/202403031725735.jpg)

刷入修补后的boot

再按回车等待几秒完成后输入命令：  
fastboot reboot  
板子重启后打开magisk（可能得多等会），看到下面四个图标，第二个就是超级用户，那么root就完成了。

![](https://img.hellohxx.top/202403031725764.jpg)

#### 备份qcn

下面是备份qcn的工作，依然在ARDC的>>这里的cmd后输入命令：adb shell su，然后会显示shell申请权限，点永久就行了，接着在magisk的超级用户里看看shell授权成功与否

![](https://img.hellohxx.top/202403031725226.jpg)

shell授权

关掉ardc，同时在任务管理器里如果发现adb还在后台也要关掉。然后打开星海svip这个软件（免安装），如果打开时提示缺少库文件，安装我提供的微软软件包，装好后最好重启一下电脑就能打开星海了，以后如果操作没问题，这个软件还是报错的就重启电脑。  
选择高通，再点联机会出现设备信息，找到高通强开1，点一键执行，在设备管理器上查看是否有端口901D（如果开启失败可以尝试手动开启，文件夹里有命令代码）

![](https://img.hellohxx.top/202403031726457.jpg)

强开端口901D

![](https://img.hellohxx.top/202403031726900.jpg)

成功开启端口901D

接着备份qcn，一键执行，选择qcn文件生成路径，正常情况就能备份qcn成功，如果不行就检查901d端口或者重启电脑，备份的qcn一般在500多k，远小于这个大小的应该是备份失败了，建议再来一次。

![](https://img.hellohxx.top/202403031726250.jpg)

## 刷机  

1）Android，一般情况刷回自己的包就用Miko loader这个软件，比较简单。刷单个分区，可以用Qualcomm工具，前面都已经介绍；或者进fastboot模式，用命令刷分区，比如刷system分区，命令就是fastboot flash system 加上分区路径（和前面刷boot一样，直接拖到这里，如果失败，把文件放到adb目录下，把分区路径换成分区文件名system.img也能刷，效果更好）。  
  
2）Debian，文件夹里有作者handsomehacker的网址，鉴于github下载较慢所以我提供了Debian的文件，其它都是小文件自己慢慢下载吧。刷机过程作者网址有介绍，001b 001c sp970 uz801作者给了boot和firmware文件用来替换。如果刷后不识别手机卡，可以这样试试看，参考了酷友lkiuyu 的动态，刷回安卓，恢复出厂设置，再root后用星海擦写基带（擦写基带在fastboot模式下），接着写入自己的qcn（写入qcn也要开启901d端口），才能装Debian，boot要替换成作者提供的001c的，别用自己的。firmware需要替换成自己备份的（把Qualcomm工具备份的NON-HLS.bin用diskgenius的虚拟磁盘打开并提取出来，接着用winscp登录Debian后把它复制到/home/user下，再ssh登录Debian，sudo -i获得权限，再用命令cp -rf /home/user/你提取的基带文件/* /usr/lib/firmware/ ，完成替换，重启板子基带应该就能用了。  
  
3）OpenWrt刷机就简单多了，进入fastboot模式打开脚本自动刷，原作者仍只提供了001b版本，其它型号直接在本版块搜索，有不少酷友编译。如果遇到问题可以到我另一个动态看看解决办法。最后说一下，Debian和openwrt都有adb功能，刷这些系统都可以进fastboot模式刷，不用回到安卓。