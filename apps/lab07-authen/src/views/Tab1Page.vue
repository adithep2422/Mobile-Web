<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>My Profile (Tab 1)</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="user">
        <ion-list>
          <ion-item>
            <ion-label>
              <h1>ยินดีต้อนรับคุณ {{ user.displayName || 'User' }}</h1>
              <p>Email: {{ user.email }}</p>
              <p>UID: <small>{{ user.uid }}</small></p>
            </ion-label>
          </ion-item>
        </ion-list>
        
        <ion-button expand="block" color="danger" @click="handleLogout" class="ion-margin-top">
          Logout
        </ion-button>
      </div>

      <div v-else class="ion-text-center">
        <ion-spinner></ion-spinner>
        <p>กำลังโหลดข้อมูลผู้ใช้...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, 
  IonContent, IonList, IonItem, IonLabel, IonButton, IonSpinner 
} from '@ionic/vue';
import { FirebaseWebAuthService } from '@/auth/auth-web';

const router = useRouter();
const authService = new FirebaseWebAuthService();
const user = ref<any>(null);

onMounted(async () => {
  // ดึงข้อมูล User จาก Firebase
  user.value = await authService.getCurrentUser();
  
  if (!user.value) {
    // ถ้าไม่มี User ให้เด้งกลับไป Login
    router.replace('/login');
  }
});

const handleLogout = async () => {
  await authService.logout();
  router.replace('/login');
};
</script>