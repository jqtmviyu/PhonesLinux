# 编译内核(debian)

这里介绍如何使用linux定制自己的内核，推荐的发行版是Ubuntu 20.04。

## 需要的软件包

不同的发行版可能对软件包命名会有所不同，这里以Ubuntu 20.04的命名为例。

- binfmt-support
- qemu-user-static
- gcc-10-aarch64-linux-gnu
- kernel-package
- fakeroot
- simg2img
- img2simg
- mkbootimg
- bison

## 生成内核debian软件包

克隆linux内核,这里选择深度为1减少体积。

```
$ git clone https://github.com/OpenStick/linux --depth=1
```

开始编译

```
$ export CROSS_COMPILE=aarch64-linux-gnu-
$ export ARCH=arm64
$ make msm8916_defconfig
$ make menuconfig
$ make -j16
```

生成debian格式的软件包

```
$ fakeroot make-kpkg  --initrd --cross-compile aarch64-linux-gnu- --arch arm64  kernel_image kernel_headers
```

之后将生成的deb软件包(会在代码目录上层生成)，与`arch/arm64/boot/Image.gz`保留备用  
将rootfs.img转换成img格式并挂载

```
$ simg2img rootfs.img root.img
$ sudo mount root.img /mnt
```

在chroot环境下，将前面生成的linux-image等deb安装包安装即可。注意要将安装完成后生成的`boot/initrd.img`取出备用（安装之前最好卸载原来的linux-image之类的软件包）。

```
$ sudo  mount --bind /proc /mnt/proc 
$ sudo  mount --bind /dev /mnt/dev
$ sudo  mount --bind /dev/pts /mnt/dev/pts
$ sudo  mount --bind /sys /mnt/sys
$ sudo  chroot /mnt
```

安装完成后，解除所有挂载，将img再次转换为simg

```
$ img2simg root.img rootfs.img
```

### 生成boot.img

取前面文件系统安装新内核后`/boot/initrd.img**`文件与内核编译阶段生成的`Image.gz`和`arch/arm64/boot/dts/qcom/`下对应设备的`*.dtb`备用  
将devicetree(dtb)附在Image.gz之后

```
 cat Image.gz dtb > kernel-dtb
```

生成boot.img

```
$ mkbootimg \     
        --base 0x80000000 \
        --kernel_offset 0x00080000 \
        --ramdisk_offset 0x02000000 \
        --tags_offset 0x01e00000 \
        --pagesize 2048 \
        --second_offset 0x00f00000 \
        --ramdisk initrd.img \
        --cmdline "earlycon root=PARTUUID=a7ab80e8-e9d1-e8cd-f157-93f69b1d141e console=ttyMSM0,115200 no_framebuffer=true rw"\
        --kernel kernel-dtb -o boot.img
```

之后将两个img文件分别刷入对应分区即可。