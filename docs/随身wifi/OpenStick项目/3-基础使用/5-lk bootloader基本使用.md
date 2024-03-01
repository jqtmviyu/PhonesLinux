# Lk Bootloader 基本使用

这里只记录和平常的lk不大一样的地方

## 获取日志

```
$ fastboot oem lk_log
$ fastboot get_staged /dev/stdout
```

## 提取分区内容

```
$ fastboot oem dump <分区名>
$ fastboot get_staged <文件名>
```

## 进入edl模式

```
$ fastboot oem reboot-edl
```