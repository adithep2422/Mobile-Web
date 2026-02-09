<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>บันทึกรายการ</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content color="light" class="ion-padding">
      <div class="header-section">
        <div class="icon-circle">
          <ion-icon :icon="addOutline"></ion-icon>
        </div>
        <h2>เพิ่มรายการใหม่</h2>
        <p>กรอกข้อมูลรายละเอียดด้านล่าง</p>
      </div>

      <div class="form-card">
        <ion-input
          label="ชื่อรายการ"
          label-placement="floating"
          fill="outline"
          v-model="title"
          class="custom-input ion-margin-bottom"
          placeholder="เช่น ค่าอาหาร, เงินเดือน"
        >
          <ion-icon :icon="createOutline" slot="start"></ion-icon>
        </ion-input>

        <ion-input
          label="จำนวนเงิน (บาท)"
          type="number"
          label-placement="floating"
          fill="outline"
          v-model="amount"
          class="custom-input ion-margin-bottom"
        >
          <ion-icon :icon="cashOutline" slot="start"></ion-icon>
        </ion-input>

        <ion-select
          label="ประเภทรายการ"
          label-placement="floating"
          fill="outline"
          v-model="type"
          class="custom-input ion-margin-bottom"
        >
          <ion-icon :icon="layersOutline" slot="start"></ion-icon>
          <ion-select-option value="income">รายรับ (Income)</ion-select-option>
          <ion-select-option value="expense">รายจ่าย (Expense)</ion-select-option>
        </ion-select>

        <ion-input
          label="หมวดหมู่"
          label-placement="floating"
          fill="outline"
          v-model="category"
          class="custom-input ion-margin-bottom"
          placeholder="เช่น อาหาร, เดินทาง, งานเสริม"
        >
          <ion-icon :icon="pricetagOutline" slot="start"></ion-icon>
        </ion-input>

        <ion-textarea
          label="หมายเหตุ (ถ้ามี)"
          label-placement="floating"
          fill="outline"
          v-model="note"
          :rows="3"
          class="custom-input ion-margin-bottom"
        >
          <ion-icon :icon="chatboxEllipsesOutline" slot="start"></ion-icon>
        </ion-textarea>

        <ion-button 
          expand="block" 
          shape="round" 
          class="save-button"
          @click="saveExpense"
        >
          <ion-icon slot="start" :icon="saveOutline"></ion-icon>
          บันทึกข้อมูล
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonInput, IonSelect, IonSelectOption, IonTextarea, IonButton, IonIcon 
} from "@ionic/vue";
import { 
  addOutline, createOutline, cashOutline, layersOutline, 
  pricetagOutline, chatboxEllipsesOutline, saveOutline 
} from "ionicons/icons";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "vue-router";

const router = useRouter();

const title = ref("");
const amount = ref<number | null>(null);
const type = ref("expense");
const category = ref("");
const note = ref("");

const saveExpense = async () => {
  if (!title.value || !amount.value) {
    alert("กรุณากรอกชื่อรายการและจำนวนเงิน");
    return;
  }

  try {
    await addDoc(collection(db, "expenses"), {
      title: title.value,
      amount: Number(amount.value),
      type: type.value,
      category: category.value,
      note: note.value,
      createdAt: new Date()
    });
    
    // ล้างค่าหลังจากบันทึก
    title.value = "";
    amount.value = null;
    category.value = "";
    note.value = "";
    
    router.push("/tabs/tab2");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
</script>

<style scoped>
/* ส่วนตกแต่งหัวข้อ */
.header-section {
  text-align: center;
  margin: 20px 0 30px 0;
}

.icon-circle {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px auto;
  color: white;
  font-size: 2rem;
  box-shadow: 0 8px 15px rgba(0, 150, 255, 0.2);
}

.header-section h2 {
  margin: 0;
  font-weight: 700;
  color: #333;
}

.header-section p {
  margin: 5px 0 0 0;
  color: #888;
  font-size: 0.9rem;
}

/* การ์ดฟอร์ม */
.form-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* ปรับแต่ง Input */
.custom-input {
  --border-radius: 12px;
  margin-bottom: 15px;
}

.custom-input ion-icon {
  color: #4facfe;
  margin-right: 10px;
  font-size: 1.2rem;
}

/* ปุ่มบันทึก */
.save-button {
  --background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --background-activated: #00f2fe;
  margin-top: 20px;
  height: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 6px 12px rgba(0, 150, 255, 0.2);
}
</style>