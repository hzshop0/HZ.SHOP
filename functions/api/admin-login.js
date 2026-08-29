<form id="productForm">

  <input type="hidden" id="productId">

  <div class="grid">

    <div>
      <label>اسم المنتج</label>
      <input id="name" required>
    </div>

    <div>
      <label>القسم</label>
      <select id="category" required>
        <option value="">اختر القسم</option>
        <option value="العطور">العطور</option>
        <option value="العناية بالبشرة">العناية بالبشرة</option>
        <option value="العناية الشخصية">العناية الشخصية</option>
        <option value="النظافة">النظافة</option>
      </select>
    </div>

    <div>
      <label>السعر</label>
      <input id="price" type="number" step="0.01" required>
    </div>

    <div>
      <label>السعر القديم</label>
      <input id="old_price" type="number" step="0.01">
    </div>

    <div>
      <label>المخزون</label>
      <input id="stock" type="number" value="0">
    </div>

    <div>
      <label>شارة المنتج</label>
      <input id="badge" placeholder="جديد / عرض / الأكثر مبيعًا">
    </div>

    <div class="full">
      <label>رابط صورة المنتج</label>
      <input id="image" placeholder="https://...">
    </div>

    <div class="full">
      <label>وصف المنتج</label>
      <textarea id="description"></textarea>
    </div>

  </div>

  <br>

  <button class="gold" type="submit">
    حفظ المنتج
  </button>

  <button class="dark" type="button" onclick="resetForm()">
    إلغاء
  </button>

  <div id="status"></div>

</form>
<div id="products" class="products">
  جاري تحميل المنتجات...
</div>
