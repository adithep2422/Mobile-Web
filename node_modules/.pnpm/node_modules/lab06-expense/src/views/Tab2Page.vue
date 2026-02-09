<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>รายรับ - รายจ่าย</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content color="light">
      <div class="summary-section ion-padding">
        <div class="balance-card">
          <p class="label">ยอดคงเหลือสุทธิ</p>
          <h1 class="balance">{{ (totalIncome - totalExpense).toLocaleString() }} ฿</h1>
          
          <div class="stats-row">
            <div class="stat-item">
              <div class="icon-box">
                <ion-icon :icon="arrowDownCircle" />
              </div>
              <div>
                <span>รายรับ</span>
                <p>+{{ totalIncome.toLocaleString() }}</p>
              </div>
            </div>
            <div class="stat-item">
              <div class="icon-box">
                <ion-icon :icon="arrowUpCircle" />
              </div>
              <div>
                <span>รายจ่าย</span>
                <p>-{{ totalExpense.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="list-container">
        <h3 class="section-title ion-padding-horizontal">รายการทั้งหมด</h3>
        
        <ion-list lines="none" class="custom-list">
          <ion-item-sliding v-for="item in expenses" :key="item.id" class="transaction-sliding">
            
            <ion-item button @click="openEditModal(item)" class="transaction-item">
              <div slot="start" class="category-icon" :class="item.type">
                <ion-icon :icon="item.type === 'income' ? walletOutline : cartOutline"></ion-icon>
              </div>

              <ion-label>
                <h3>{{ item.title }}</h3>
                <p>{{ item.category }} | {{ item.note || 'ไม่มีหมายเหตุ' }}</p>
              </ion-label>

              <div slot="end" class="amount-col">
                <span :class="item.type">
                  {{ item.type === 'income' ? '+' : '-' }}{{ item.amount.toLocaleString() }}
                </span>
                <small class="edit-hint">แก้ไข</small>
              </div>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option color="danger" expandable @click="confirmDelete(item)">
                <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>

        <div v-if="expenses.length === 0" class="empty-state">
          <ion-icon :icon="documentTextOutline" size="large"></ion-icon>
          <p>ยังไม่มีรายการบันทึกในขณะนี้</p>
        </div>
      </div>

      <ion-modal :is-open="isModalOpen" @didDismiss="isModalOpen = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>แก้ไขข้อมูล</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isModalOpen = false">ปิด</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <ion-input label="ชื่อรายการ" label-placement="floating" fill="outline" class="ion-margin-bottom" v-model="editItem.title"></ion-input>
          <ion-input label="จำนวนเงิน" type="number" label-placement="floating" fill="outline" class="ion-margin-bottom" v-model="editItem.amount"></ion-input>
          
          <ion-select label="ประเภท" label-placement="floating" fill="outline" class="ion-margin-bottom" v-model="editItem.type">
            <ion-select-option value="income">รายรับ</ion-select-option>
            <ion-select-option value="expense">รายจ่าย</ion-select-option>
          </ion-select>

          <ion-input label="หมวดหมู่" label-placement="floating" fill="outline" class="ion-margin-bottom" v-model="editItem.category"></ion-input>
          <ion-textarea label="หมายเหตุ" label-placement="floating" fill="outline" class="ion-margin-bottom" v-model="editItem.note" :rows="3"></ion-textarea>

          <ion-button expand="block" shape="round" @click="handleUpdate">
            บันทึกการแก้ไข
          </ion-button>
        </ion-content>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonIcon, IonModal, IonButtons, IonButton,
  IonInput, IonSelect, IonSelectOption, IonTextarea,
  IonItemSliding, IonItemOptions, IonItemOption, alertController 
} from '@ionic/vue';
import { 
  arrowDownCircle, arrowUpCircle, walletOutline, cartOutline, 
  documentTextOutline, trashOutline 
} from 'ionicons/icons';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// --- State Management ---
const expenses = ref<any[]>([]);
const isModalOpen = ref(false);
const editItem = ref<any>({});

// --- 1. Real-time Data Fetching ---
onMounted(() => {
  const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    expenses.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });
});

// --- 2. Update Logic ---
const openEditModal = (item: any) => {
  editItem.value = { ...item }; // Copy ข้อมูลใส่ตัวแปรพัก
  isModalOpen.value = true;
};

const handleUpdate = async () => {
  try {
    const docRef = doc(db, "expenses", editItem.value.id);
    await updateDoc(docRef, {
      title: editItem.value.title,
      amount: Number(editItem.value.amount),
      type: editItem.value.type,
      category: editItem.value.category,
      note: editItem.value.note
    });
    isModalOpen.value = false;
  } catch (error) {
    console.error("Update Error:", error);
  }
};

// --- 3. Delete Logic (Swipe to Delete) ---
const confirmDelete = async (item: any) => {
  const alert = await alertController.create({
    header: 'ยืนยันการลบ',
    message: `ต้องการลบรายการ "${item.title}" ใช่หรือไม่?`,
    buttons: [
      { text: 'ยกเลิก', role: 'cancel' },
      { 
        text: 'ลบ', 
        role: 'destructive', 
        handler: async () => {
          await deleteDoc(doc(db, "expenses", item.id));
        } 
      }
    ],
  });
  await alert.present();
};

// --- 4. Summary Calculation ---
const totalIncome = computed(() => 
  expenses.value.filter(i => i.type === 'income').reduce((s, i) => s + Number(i.amount), 0)
);

const totalExpense = computed(() => 
  expenses.value.filter(i => i.type === 'expense').reduce((s, i) => s + Number(i.amount), 0)
);
</script>

<style scoped>
/* สไตล์ Dashboard Card */
.balance-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 24px;
  padding: 25px;
  color: white;
  box-shadow: 0 12px 24px rgba(0, 150, 255, 0.25);
  margin-bottom: 15px;
}

.balance-card .label { margin: 0; font-size: 0.9rem; opacity: 0.8; }
.balance-card .balance { margin: 8px 0 20px 0; font-size: 2.4rem; font-weight: 800; }

.stats-row { display: flex; justify-content: space-between; }
.stat-item { display: flex; align-items: center; gap: 12px; }
.stat-item span { font-size: 0.8rem; opacity: 0.8; }
.stat-item p { margin: 0; font-weight: 700; font-size: 1.1rem; }

.icon-box {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.25); font-size: 1.4rem;
}

/* สไตล์รายการ List */
.section-title { font-size: 1.1rem; font-weight: 700; color: #444; margin: 10px 0; }
.transaction-sliding { margin-bottom: 12px; border-radius: 16px; overflow: hidden; }

.transaction-item {
  --background: white;
  --padding-start: 16px;
  --padding-end: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.category-icon {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; margin-right: 16px;
}
.category-icon.income { background: #e0f2f1; color: #009688; }
.category-icon.expense { background: #ffebee; color: #e91e63; }

.amount-col { text-align: right; }
.amount-col span { font-weight: 800; font-size: 1.1rem; }
.amount-col .income { color: #009688; }
.amount-col .expense { color: #e91e63; }
.edit-hint { color: #bbb; font-size: 0.7rem; display: block; }

.empty-state { text-align: center; padding: 60px 20px; color: #bbb; }
ion-item-option { --padding-start: 20px; --padding-end: 20px; }
</style>