<template>
  <div
    class="incoming"
    :class="{
      playerIsHere: buyer.playerIsHere,
      playerIsNotHere: !buyer.playerIsHere,
    }"
  >
    <div class="number">
      <p>{{ buyer.id }}</p>
    </div>
    <div>
      <audio id="notificationSound" :src="notifSoundFile"></audio>
      <div class="flex-row">
        <div
          class="message-container interactive"
          @mouseenter="markMessagesAsRead"
        >
          <li
            class="fa-regular fa-message message-icon"
            :class="{
            newmsg: buyer.messages.findIndex((m:any) => m.unread === true) != -1,
          }"
          ></li>
          <div class="message-popup">
            <p v-if="buyer.messages.length === 0">Aucun message</p>
            <ul v-else>
              <li v-for="(msg, index) in buyer.messages" :key="index">
                <strong>[{{ formatTime(msg.date) }}]</strong>
                <em>({{ msg.direction }})</em> : {{ msg.message }}<br />
              </li>
            </ul>
          </div>
        </div>

        <div class="username">
          {{ buyer.playername }}
        </div>
        <div class="time">{{ tempsEcoule }}</div>
      </div>
      <div class="flex-row secondline">
        <div>
          <button
            class="fas fa-clipboard interactive"
            @click="copyObjectToClipboard"
            title="Copier le nom de l'objet"
          ></button>
        </div>
        <div class="objet">
          {{ buyer.objet }}
        </div>
        <div class="quantity">{{ buyer.price.quantity }}</div>
        <div class="currency"><img :src="img" /></div>
      </div>
      <div class="flex-row-reverse">
        {{ buyer.league }} (Tab: {{ buyer.tab }} / Pos: {{ buyer.xpos }};{{
          buyer.ypos
        }})
      </div>
      <div class="flex-row commands">
        <button
          title="Demander d'attendre"
          class="fa-regular fa-hourglass-half"
          @click="SayWait()"
        ></button>
        <div class="separator"></div>
        <button
          :class="{ currentAction: buyer.currentAction == 'invite' }"
          :disabled="buyer.direction == 'buy'"
          title="invite"
          class="fa-solid fa-people-line"
          @click="Invite()"
        ></button>
        <button
          :class="{
            currentAction:
              buyer.currentAction == 'hideout' && buyer.direction == 'buy',
          }"
          :disabled="buyer.direction == 'buy'"
          title="Rentrer au hideout."
          class="fa-solid fa-house"
          @click="ReturnHideout()"
        ></button>
        <button
          :class="{
            currentAction:
              buyer.currentAction == 'hideout' && buyer.direction == 'sell',
          }"
          :disabled="buyer.direction == 'sell'"
          title="Se rendre au hideout du joueur."
          class="fa-solid fa-house-flag"
          @click="ToPlayerHideout()"
        ></button>
        <div class="separator"></div>
        <div class="separator"></div>
        <button
          :class="{ currentAction: buyer.currentAction == 'trade' }"
          title="Echanger"
          class="fa-solid fa-right-left"
          @click="Exchange()"
        ></button>
        <button
          :class="{ currentAction: buyer.currentAction == 'thx' }"
          title="Dire merci"
          class="fa-regular fa-face-smile-beam"
          @click="SayThx()"
        ></button>
        <button
          :class="{ currentAction: buyer.currentAction == 'kick' }"
          title="Renvoyer le joueur et finir la transaction"
          class="fa-solid fa-person-walking-arrow-right"
          @click="Ungroup()"
        ></button>
        <div class="separator"></div>
        <div class="separator"></div>
        <div class="separator"></div>
        <div class="separator"></div>
        <div class="separator"></div>
        <div class="separator"></div>
        <button
          title="Fermer"
          class="fa-solid fa-xmark"
          @click="destroySelf()"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Buyer } from '../../shared/types';
import { GameCommands } from '../../shared/ipc-events';

import '@fortawesome/fontawesome-free/css/all.min.css';
import alchIcon from '@/assets/currency/39px-Orb_of_Alchemy_inventory_icon.png';
import regalIcon from '@/assets/currency/39px-Orb_of_Alchemy_inventory_icon.png';
import defaultNofifSound from '@/assets/sound/notification.mp3';

const img = ref('');
const tempsEcoule = ref('');
const notifSoundFile = ref(defaultNofifSound);
const props = defineProps<{
  buyer: Buyer;
}>();

switch (props.buyer.price.currency) {
  case 'alch':
    img.value = alchIcon;
    break;
  case 'regal':
    img.value = regalIcon;
    break;
}

function Invite() {
  window.ipcRenderer.send(GameCommands.INVITE, props.buyer.playername);
}

function Exchange() {
  window.ipcRenderer.send(GameCommands.TRADE, props.buyer.playername);
}

function SayThx() {
  window.ipcRenderer.send(GameCommands.SAY_THX, props.buyer.playername);
  const destroySelf = () => {
    emit('destroy', props.buyer.id); // Émet un événement avec l'ID de l'acheteur
  };
}

function Ungroup() {
  window.ipcRenderer.send(GameCommands.KICK, props.buyer.playername);
}

function SayWait() {
  window.ipcRenderer.send(GameCommands.SAY_WAIT, props.buyer.playername);
}

function ToPlayerHideout() {
  window.ipcRenderer.send(
    GameCommands.TO_PLAYER_HIDEOUT,
    props.buyer.playername
  );
}

function ReturnHideout() {
  window.ipcRenderer.send(GameCommands.HIDEOUT);
}

const emit = defineEmits(['destroy']);

const destroySelf = () => {
  emit('destroy', props.buyer.id); // Émet un événement avec l'ID de l'acheteur
};

function markMessagesAsRead() {
  props.buyer.messages.forEach((msg) => {
    msg.unread = false;
  });
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function copyObjectToClipboard() {
  if (props.buyer.objet) {
    navigator.clipboard
      .writeText(props.buyer.objet.trim().replaceAll(',', ''))
      .then(() => {
        console.log('Texte copié :', props.buyer.objet);
      })
      .catch((err) => {
        console.error('Erreur de copie :', err);
      });
  }
}

// fonction utilitaire pour formatter le temps
function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (hours > 0)
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  if (minutes > 0) return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  return `${seconds}s`;
}

let intervalId: number;

function playNotificationSound() {
  let audio: HTMLAudioElement = document.getElementById(
    'notificationSound'
  ) as HTMLAudioElement;
  audio
    ?.play()
    ?.catch((e) => console.error('Erreur lors de la lecture du son:', e));
}

onMounted(() => {
  playNotificationSound();
  intervalId = window.setInterval(() => {
    const now = new Date();
    const diff = now.getTime() - new Date(props.buyer.date).getTime();
    tempsEcoule.value = formatElapsed(diff);
  }, 1000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<style>
.incoming {
  display: flex;
  flex-direction: row;
  color: gold;
  background-color: black;
}

.number {
  color: gold;
  font-size: 30px;
  width: 30px;
  vertical-align: middle;
  padding-left: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Ombre portée */
}
.playerIsHere {
  border: 1px greenyellow solid;
  animation: bgHere 1.2s infinite alternate;
  background: linear-gradient(
    to right,
    greenyellow 2%,
    black 20%,
    black 90%,
    transparent 100%
  );
  background-size: 100% 100%;
}

.playerIsNotHere {
  border: 1px green solid;
  background: linear-gradient(
    to right,
    green 2%,
    black 20%,
    black 90%,
    transparent 100%
  );
}

.username {
  font-size: 18px;
  flex-shrink: 0;
  flex-grow: 8;
  padding-left: 3px;
}

.separator {
  height: 32px;
  width: 8px;
}

button {
  background-color: rgb(158, 125, 52);
  border: 1px solid rgb(104, 82, 34);
  margin-right: 4px;
  height: 32px;
  width: 32px;
  border-radius: 4px;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  color: gold;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

button.currentAction {
  border: 1px greenyellow solid;
  color: greenyellow;
  transform: scale(1.2);
}

button:hover {
  background-color: rgb(180, 140, 60);
  box-shadow: 2px 2px 1px 1px rgba(46, 36, 0, 0.8);
  transform: scale(1.1);
}

button:active {
  background-color: rgb(120, 95, 40);
  transform: scale(0.95);
}

button:disabled {
  background-color: rgb(49, 41, 22);
  transform: scale(0.95);
  color: rgb(129, 110, 0);
  border: 1px solid rgb(48, 38, 16);
}

.secondline {
  min-height: 36px;
  max-height: 36px;
  overflow: hidden;
}

.commands {
  padding-bottom: 8px;
  padding-top: 8px;
}

.secondline > * {
  overflow: hidden;
  white-space: normal; /* ou wrap */
  align-items: center; /* aligne verticalement */
  display: flex;
}

.objet {
  color: white;
  min-width: 260px;
  max-width: 260px;
  min-height: 34px;
  max-height: 34px;
  overflow: hidden;
  flex-grow: 8;
}
.currency {
  height: 32px;
  max-height: 32px;
}

.flex-row {
  display: flex;
  flex-direction: row;
  /* justify-content: space-between; */
  padding-left: 2px;
  padding-right: 2px;
}

.flex-col {
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  padding-left: 2px;
  padding-right: 2px;
}

.flex-row-reverse {
  display: flex;
  flex-direction: row-reverse;
  /* justify-content: space-between; */
  padding-left: 2px;
  padding-right: 2px;
}

.message-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.message-icon {
  font-size: 24px;
}

.message-popup {
  display: none;
  position: absolute;
  top: 120%;
  left: 0;
  z-index: 10;
  background: black;
  padding: 12px;
  border-radius: 8px;
  border: 1px gold solid;
  box-shadow: 0px 2px 10px rgba(255, 215, 0, 0.2);
  /* white-space: nowrap; */
  min-width: 250px;
  max-width: 500px;
  width: 500px;
}

.message-container:hover .message-popup {
  display: block;
}

.message-popup ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.message-popup li {
  margin-bottom: 6px;
}

.newmsg {
  animation: pulse 1.2s infinite alternate;
}

@keyframes pulse {
  0% {
    color: gold;
    transform: scale(1);
  }
  100% {
    color: red;
    transform: scale(1.2);
  }
}

@keyframes bgHere {
  from {
    background: linear-gradient(
      to right,
      greenyellow 2%,
      black 20%,
      black 90%,
      transparent 100%
    );
    background-size: 100% 100%;
  }
  to {
    background: linear-gradient(
      to right,
      green 2%,
      black 20%,
      black 90%,
      transparent 100%
    );
    background-size: 100% 100%;
  }
}
</style>
