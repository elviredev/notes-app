<script setup>
import { ref } from 'vue'
import { supabase } from '@/supabase/init'
import { format, parseISO } from 'date-fns'

const showModal = ref(false)
const text = ref('')
const createdAt = ref('')
const backgroundColor = ref('')
const errorMsg = ref('')
const data = ref([])
const dataLoaded = ref(false)
function getRandomColor() {
  return 'hsl(' + Math.random() * 360 + ', 100%, 75%)'
}

const resetModal = () => {
  text.value = ''
  errorMsg.value = ''
}

const closeModal = () => {
  showModal.value = false
  resetModal()
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
    const { error } = await supabase.from('notes').insert([
      {
        text: text.value,
        backgroundColor: getRandomColor()
      }
    ])
    if (error) throw error
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
</script>

<template>
  <div v-if="dataLoaded" class="min-h-full mx-auto font-Poppins box-borde">
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
            class="py-4 mt-2 bg-blue-500 rounded-md w-full text-white text-lg hover:border hover:border-blue-500 hover:bg-white hover:text-blue-500"
          >
            Ajouter une note
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
        <h1 class="text-2xl text-blue-700 tracking-widest sm:text-4xl">Notes</h1>
        <button
          @click="showModal = true"
          class="bg-blue-700 w-12 h-12 rounded-full text-white text-2xl hover:bg-opacity-75"
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
            class="relative flex flex-col h-80 w-auto justify-between p-8 border-2 rounded-md shadow-lg"
            :style="{ backgroundColor: note.backgroundColor }"
          >
            <p class="text-sm">
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700&display=swap');
</style>
