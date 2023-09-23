<script setup>
import { computed, ref } from 'vue'
import { supabase } from '@/supabase/init'
import { format, parseISO } from 'date-fns'

const showModal = ref(false)
const text = ref('')
const createdAt = ref('')
const backgroundColor = ref('')
const errorMsg = ref('')
const data = ref([])
const dataLoaded = ref(false)

// Mode edit
const isEditMode = ref(false)

// Variables pour contrôler l'affichage des boutons
const showAddButton = computed(() => !isEditMode.value)
const showEditButton = computed(() => isEditMode.value)

// stocker la note sélectionnée pour la modification
const selectedNote = ref(null)

// Méthode pour générer un background aléatoire
function getRandomColor() {
  return 'hsl(' + Math.random() * 360 + ', 100%, 75%)'
}

// Méthode pour exécuter à la fois la réinitialisation du texte et du message d'erreur
const resetModal = () => {
  text.value = ''
  errorMsg.value = ''
}

// Méthode permettant de fermer la modale et de réinitialiser les valeurs dans le textarea
const closeModal = () => {
  showModal.value = false
  resetModal()
}

// Mode Edit pour la note sélectionnée (click sur le crayon pour editer la note)
const editNote = (note) => {
  // Sélectionner la note actuelle pour la modification
  selectedNote.value = note
  // Préremplir le champ de texte avec le contenu de la note
  text.value = note.text
  // Définir isEditMode sur true
  isEditMode.value = true
  // Afficher la modal en mode modification
  showModal.value = true
}

const getData = async () => {
  try {
    const { data: notes, error } = await supabase.from('notes').select('*')
    if (error) throw error
    data.value = notes
    dataLoaded.value = true
  } catch (error) {
    console.warn(error.message)
  }
}
getData()

const addNote = async () => {
  if (text.value.length < 10 || text.value.length > 255) {
    return (errorMsg.value = 'La note doit avoir entre 10 et 255 caractères')
  }
  try {
    // Stockez la valeur actuelle de isEditMode.value
    const isEditModeValue = isEditMode.value
    // Réinitialisez isEditMode.value à false avant d'appeler updateNote
    isEditMode.value = false
    // Si on est en mode edition
    if (isEditModeValue) {
      //console.log(selectedNote.value)
      await updateNote()
      // Sortir du mode édition après la mise à jour
      isEditMode.value = false
    } else {
      const { error } = await supabase.from('notes').insert([
        {
          text: text.value,
          backgroundColor: getRandomColor()
        }
      ])
      if (error) throw error
    }

    showModal.value = false
    resetModal()
    // Met à jour la liste des notes après avoir ajouté une nouvelle note
    await getData()
  } catch (error) {
    errorMsg.value = `Erreur survenue : ${error.message}`
  }
}

const deleteNote = async (noteId) => {
  try {
    const { error } = await supabase.from('notes').delete().eq('id', noteId)
    if (error) throw error
    // Met à jour la liste des notes après avoir supprimé la note
    await getData()
  } catch (error) {
    errorMsg.value = `Erreur: ${error.message}`
  }
}

const updateNote = async () => {
  if (!selectedNote.value || !selectedNote.value.id) {
    console.error('selectedNote.value is null or id is undefined')
    return
  }

  if (text.value.length < 10 || text.value.length > 255) {
    return (errorMsg.value = 'La note doit avoir entre 10 et 255 caractères')
  }

  try {
    const { error } = await supabase
      .from('notes')
      .update({ text: text.value })
      .eq('id', selectedNote.value.id)
    if (error) throw error
    showModal.value = false
    resetModal()
  } catch (error) {
    errorMsg.value = `Erreur survenue : ${error.message}`
  }
}
</script>

<template>
  <div v-if="dataLoaded" class="bg-perso min-h-screen mx-auto font-Poppins box-border">
    <!-- Overlay / Modal -->
    <div
      v-if="showModal"
      class="absolute h-full w-full bg-black bg-opacity-75 z-10 flex flex-col justify-center items-center"
    >
      <div
        class="relative flex flex-col bg-white w-full px-8 py-11 sm:max-w-4xl shadow-lg rounded-md"
      >
        <form @submit.prevent="addNote" class="flex flex-col w-full">
          <textarea
            v-model.trim="text"
            class="border border-blue-300 rounded-md resize-none p-2 focus:outline-none"
            name="text"
            id="text"
            cols="30"
            rows="10"
          ></textarea>
          <p v-if="errorMsg" class="text-red-600 mt-2">{{ errorMsg }}</p>
          <button
            v-if="showAddButton"
            class="py-4 mt-2 bg-blue-500 rounded-md w-full text-white text-lg hover:border hover:border-blue-500 hover:bg-white hover:text-blue-500"
          >
            Ajouter une note
          </button>
          <button
            v-if="showEditButton"
            class="py-4 mt-2 bg-blue-500 rounded-md w-full text-white text-lg hover:border hover:border-blue-500 hover:bg-white hover:text-blue-500"
          >
            Modifier une note
          </button>
          <button
            @click="closeModal"
            class="absolute top-1.5 right-6 text-base text-white bg-red-500 rounded-full h-8 w-8 hover:border hover:border-red-500 hover:bg-white hover:text-red-600"
          >
            X
          </button>
        </form>
      </div>
    </div>
    <!-- Notes Container -->
    <div class="container py-10 px-4">
      <header class="flex justify-between items-center">
        <h1 class="text-2xl text-blue-500 tracking-widest sm:text-4xl">Notes</h1>
        <button
          @click="showModal = true"
          class="bg-blue-500 w-12 h-12 rounded-full text-white text-2xl hover:bg-white hover:text-blue-500 transition-all duration-200"
        >
          +
        </button>
      </header>

      <div class="container mt-24">
        <!-- Cards Container -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <!-- Card -->
          <div
            v-for="(note, index) in data"
            :key="index"
            class="relative flex flex-col h-80 w-auto justify-between p-8 rounded-md shadow-lg"
            :style="{ backgroundColor: note.backgroundColor }"
          >
            <p class="text-sm break-words whitespace-pre-wrap">
              {{ note.text }}
            </p>

            <p class="text-xs italic text-gray-700">
              {{ format(parseISO(note.created_at), 'dd-MM-yyyy HH:mm') }}
            </p>
            <div
              @click="deleteNote(note.id)"
              class="absolute top-1.5 right-1.5 cursor-pointer hover:rotate-45 transition-all duration-200"
            >
              <svg
                width="26px"
                height="26px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="24" height="24" fill="transparent" />
                <path d="M5 7.5H19L18 21H6L5 7.5Z" stroke="#000000" stroke-linejoin="round" />
                <path
                  d="M15.5 9.5L15 19"
                  stroke="#000000"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 9.5V19"
                  stroke="#000000"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M8.5 9.5L9 19"
                  stroke="#000000"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M16 5H19C20.1046 5 21 5.89543 21 7V7.5H3V7C3 5.89543 3.89543 5 5 5H8M16 5L15 3H9L8 5M16 5H8"
                  stroke="#000000"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div
              @click="editNote(note)"
              class="absolute top-1.5 left-1.5 cursor-pointer hover:-rotate-45 transition-all duration-200"
            >
              <svg
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                width="26px"
                height="26px"
                viewBox="0 0 64 64"
                xml:space="preserve"
              >
                <path
                  fill="#231F20"
                  d="M62.828,12.482L51.514,1.168c-1.562-1.562-4.093-1.562-5.657,0.001c0,0-44.646,44.646-45.255,45.255
	C-0.006,47.031,0,47.996,0,47.996l0.001,13.999c0,1.105,0.896,2,1.999,2.001h4.99c0.003,0,9.01,0,9.01,0s0.963,0.008,1.572-0.602
	s45.256-45.257,45.256-45.257C64.392,16.575,64.392,14.046,62.828,12.482z M37.356,12.497l3.535,3.536L6.95,49.976l-3.536-3.536
	L37.356,12.497z M8.364,51.39l33.941-33.942l4.243,4.243L12.606,55.632L8.364,51.39z M3.001,61.995c-0.553,0-1.001-0.446-1-0.999
	v-1.583l2.582,2.582H3.001z M7.411,61.996l-5.41-5.41l0.001-8.73l14.141,14.141H7.411z M17.557,60.582l-3.536-3.536l33.942-33.94
	l3.535,3.535L17.557,60.582z M52.912,25.227L38.771,11.083l2.828-2.828l14.143,14.143L52.912,25.227z M61.414,16.725l-4.259,4.259
	L43.013,6.841l4.258-4.257c0.782-0.782,2.049-0.782,2.829-0.002l11.314,11.314C62.195,14.678,62.194,15.943,61.414,16.725z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700&display=swap');

.bg-perso {
  background-color: #0f0f0f;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23708bf4' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E");
}
</style>
