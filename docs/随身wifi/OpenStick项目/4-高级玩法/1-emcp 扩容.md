# emcp 扩容

这里只记录在linux下的扩容过程，windows应该类似，使用9008模式下的备份工具备份整个emcp上的内容即可（包含分区表）。高通的9008模式恢复时会将userdata分区自动扩充到所有可用的空间，所以理论上来说安卓系统也适合该方法备份（据部分用户反映安卓系统在扩容后的机器中无法使用）。

- 注意：方法仅供参考，不代表百分之百在你的环境中可用。

## 硬件

按照原机搭配的emcp，可以确定emcp必须满足以下条件。

- 内置的内存必须是**lpddr2** （不敢确定 我的机器大部分搭配的是lpddr2 msm8916支持lpddr3但可能需要不同的电压来驱动，即使电压一样也许需要使用不同的loader来初始化内存）
- bga封装必须是**bga162**
- 符合规格的芯片会在焊接到位后上电进入9008(edl)模式，其他情况则会没有任何反应。

经过测试以下的芯片可以兼容UFI001B/C机型

- 08emcp08-nl2cv100 (bga162 lpddr2 1g + 8g emmc)
- kmk8x000vm-b412 (bga162 lpddr2 1g + 16g emmc)

## 软件

推荐使用linux下的edl工具,安装之前默认你的环境中有python3及yay。

```
$ yay -S edl-git
```

- 不是Arch-based的发行版建议直接按照[edl官方](https://github.com/bkerler/edl)的方法安装。

之后长按机器上电，进入9008模式，输入以下指令备份emcp中的内容。

```
$ edl rl dumps --skip=userdata --genxml
```

- 如果长时间卡住，建议ctrl+c以后重试。
- 如果你的edl报例如no suitable loader found一类的错误，则可以尝试其他的loader初始化内存，edl提供了很多loader这里以红米2的loader为例(loader路径 不同的linux环境可能会有差异，仅供参考)。

```
$ edl rl dumps --skip=userdata --genxml  \
--loader /usr/lib/python3.10/site-packages/edlclient-3.53-py3.10.egg/edlclient/../Loaders/xiaomi/007050e100000000_50838757eab7c632_fhprg_peek_wt88047.bin
```

换上新的emcp后，会出现9008设备，此时在备份文件夹里输入以下指令

```
$ edl qfil rawprogram0.xml patch0.xml
```

- 如果出错，同上，加入loader参数即可。

重启机器，灯光亮起即代表扩容成功。

```
$ edl reset
```

## 参考资料

这里有些常见的emcp&emmc型号，仅供参考  
(感谢 酷安@Zy143L 的整理)  
![](https://img.kancloud.cn/73/77/737793fbbfe867841f9da7bc599d03e9_611x476.png)  
![](https://img.kancloud.cn/1a/d7/1ad7a1877712a0d44af13399cf7239c2_487x2353.png)