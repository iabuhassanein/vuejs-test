<template>
  <v-container>
    <v-row>
      <v-card
        class="mx-auto"
        max-width="344"
        outlined
        v-for="(cat, index) in categories"
        :key="index+'-'+cat.id"
      >
        <v-list-item three-line>
          <v-list-item-content>
            <v-list-item-title class="headline mb-1">
              {{cat.name}}
            </v-list-item-title>
            <v-list-item-subtitle>{{ cat.slug }}</v-list-item-subtitle>
          </v-list-item-content>

          <v-img
            tile
            width="80"
            max-width="80"
            color="grey"
            :src="cat.img_url"
          />
        </v-list-item>

        <v-card-actions>
          <v-btn
            outlined
            rounded
            text
            v-on:click="openDialog(cat)"
          >
            Show
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
    <v-row>
      <PrankIdeaDialog :modal="dialog" @close="closeDialog" :category="selectedCategory"></PrankIdeaDialog>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'CategoriesIndex',
  data () {
    return {
      loading: false,
      dialog: false,
      selectedCategory: undefined
    }
  },
  mounted () {
    if (this.categories === undefined || this.categories.length === 0) { this.fetchCategories() }
  },
  computed: {
    ...mapState(['categories'])
  },
  methods: {
    async fetchCategories () {
      await this.$axios.get('category?limit=10&page=1&filters[slug][]=view-all-pranks&filters[slug][]=new-prank-calls&filters[slug][]=food-restaurant-prank-calls').then((response) => {
        if (response.status === 200) {
          this.$store.dispatch('setCategories', response.data.data)
        }
        // eslint-disable-next-line node/handle-callback-err
      }).catch((error) => {
        console.log(error)
      })
    },
    openDialog (_cat) {
      this.selectedCategory = _cat
      this.dialog = true
      // Note: i'm using this way to change url, because routing on Vue working way different from React
      window.history.pushState({}, null, `/category/${_cat.slug}`)
    },
    closeDialog () {
      this.dialog = false
      // Note: i'm using this way to change url, because routing on Vue working way different from React
      window.history.pushState({}, null, '/')
    }
  }
}
</script>

<style scoped>

</style>
