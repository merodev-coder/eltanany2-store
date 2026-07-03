import os

path = r"C:\Users\ELTANANY 01062856027\Desktop\eltanany\frontend\src\pages\ProfilePage.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = """const handleUploadComplete = (res: Array<{ fileUrl: string; fileName: string }>) => {
  if (res?.[0]) {
    setUploadedFile({ url: res[0].fileUrl, name: res[0].fileName });
    toast.success('تم رفع الملف بنجاح');
  }
  setIsUploading(false);
};"""

new = """const handleUploadComplete = async (res: Array<{ fileUrl: string; fileName: string }>) => {
  if (res?.[0]) {
    const fileUrl = res[0].fileUrl;
    const fileName = res[0].fileName;
    setUploadedFile({ url: fileUrl, name: fileName });
    try {
      await axiosClient.post('/admin/settings/price-list', { url: fileUrl, fileName });
      toast.success('تم حفظ قائمة الأسعار بنجاح');
    } catch {
      toast.error('تم الرفع لكن فشل حفظ البيانات — حاول مرة أخرى');
    }
  }
  setIsUploading(false);
};"""

if old in content:
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS")
else:
    print("ERROR: snippet not found")
    idx = content.find("handleUploadComplete")
    if idx >= 0:
        print(repr(content[idx:idx + 300]))
