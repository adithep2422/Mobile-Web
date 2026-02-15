<template>
  <ion-page>
    <ion-content class="ion-padding ion-text-center">
      
      <div class="login-header ion-margin-bottom">
        <ion-icon :icon="personCircleOutline" size="large" color="primary"></ion-icon>
        <h1>Login</h1>
      </div>

      <div v-if="!isOtpMode">
        <ion-list lines="none">
          <ion-item class="custom-input ion-margin-bottom">
            <ion-input v-model="email" label="Email" label-placement="floating" type="email"></ion-input>
          </ion-item>
          <ion-item class="custom-input ion-margin-bottom">
            <ion-input v-model="password" label="Password" label-placement="floating" type="password"></ion-input>
          </ion-item>
        </ion-list>

        <ion-button expand="block" shape="round" @click="handleEmailLogin">
          Login with Email/Password
        </ion-button>

        <div class="divider">OR</div>

        <ion-button expand="block" fill="outline" shape="round" color="danger" @click="handleGoogleLogin">
          <ion-icon slot="start" :icon="logoGoogle"></ion-icon>
          Login with Google
        </ion-button>

        <ion-item class="custom-input ion-margin-top">
          <ion-input v-model="phoneNumber" label="Phone (e.g. +66812345678)" label-placement="floating"></ion-input>
        </ion-item>
        <ion-button expand="block" fill="outline" shape="round" color="success" @click="handleStartPhone">
          <ion-icon slot="start" :icon="callOutline"></ion-icon>
          Login by Phone
        </ion-button>
      </div>

      <div v-else>
        <h3>Enter OTP Code</h3>
        <ion-item class="custom-input ion-margin-bottom">
          <ion-input v-model="otpCode" placeholder="6-digit code"></ion-input>
        </ion-item>
        <ion-button expand="block" color="success" @click="handleConfirmOtp">Confirm OTP</ion-button>
        <ion-button fill="clear" color="medium" @click="isOtpMode = false">Back</ion-button>
      </div>

      <div id="recaptcha-container"></div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonContent, IonButton, IonIcon, 
  IonInput, IonItem, IonList, toastController 
} from '@ionic/vue';
import { logoGoogle, callOutline, personCircleOutline } from 'ionicons/icons';

// Import Service (ปรับ path ให้ตรงกับโฟลเดอร์ของคุณ)
import { FirebaseWebAuthService } from '@/auth/auth-web';

const router = useRouter();
const authService = new FirebaseWebAuthService();

// Data States
const email = ref('');
const password = ref('');
const phoneNumber = ref('');
const otpCode = ref('');
const isOtpMode = ref(false);
const verificationId = ref('');

// Helper: แจ้งเตือนข้อความ
const notify = async (text: string) => {
  const toast = await toastController.create({
    message: text,
    duration: 2000,
    position: 'bottom'
  });
  await toast.present();
};

// 1. Login Email/Password
const handleEmailLogin = async () => {
    console.log("==> Button Email Clicked!");
  try {
    const user = await authService.loginWithEmailPassword({ 
      email: email.value, 
      password: password.value 
    });
    if (user) router.replace('/tabs/tab1');
  } catch (error: any) {
    notify("Login Failed: " + error.message);
  }
};

// 2. Login Google
const handleGoogleLogin = async () => {
  try {
    const user = await authService.loginWithGoogle();
    if (user) router.replace('/tabs/tab1');
  } catch (error: any) {
    notify("Google Error: " + error.message);
  }
};

// 3. Login Phone (Start)
const handleStartPhone = async () => {
  if (!phoneNumber.value) return notify("Please enter phone number");
  try {
    const res = await authService.startPhoneLogin({ 
      phoneNumberE164: phoneNumber.value 
    });
    verificationId.value = res.verificationId;
    isOtpMode.value = true;
    notify("OTP sent to " + phoneNumber.value);
  } catch (error: any) {
    notify("Phone Error: " + error.message);
  }
};

// 4. Login Phone (Confirm)
const handleConfirmOtp = async () => {
  try {
    const user = await authService.confirmPhoneCode({
      verificationId: verificationId.value,
      verificationCode: otpCode.value
    });
    if (user) router.replace('/tabs/tab1');
  } catch (error: any) {
    notify("Invalid OTP: " + error.message);
  }
};
</script>

<style scoped>
.login-header { margin-top: 50px; }
.logo-icon { font-size: 80px; }
.divider { margin: 20px 0; color: #888; }
.custom-input {
  --background: #f4f5f8;
  --border-radius: 8px;
}
#recaptcha-container {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}
</style>