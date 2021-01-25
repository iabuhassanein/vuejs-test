/* eslint no-use-before-define: 0 */
<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    scrollable
  >
    <v-card tile>
      <v-toolbar
        flat
        dark
        color="primary"
      >
        <v-btn
          icon
          dark
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Prank Ideas From Category: {{ category.name }}</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            dark
            text
            @click="closeDialog"
          >
            Ok
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-text>
        <v-container>
          <v-row style="padding: 30px 0">
            <v-col>
              <v-row>
                <v-text-field
                  v-model.trim="search"
                  label="Regular"
                  @keyup="inputChange"
                />
              </v-row>
              <v-row>
                <v-card
                  v-for="(idea, index) in list"
                  :key="index+'-'+idea.id"
                  class="mx-auto"
                  max-width="400"
                  style="margin-bottom: 20px"
                >
                  <v-img
                    :src="idea.img_url"
                    height="200px"
                  />

                  <v-card-title>
                    {{ idea.title }}
                  </v-card-title>

                  <v-card-subtitle>
                    {{ idea.share_text }}
                  </v-card-subtitle>

                  <v-card-actions style="padding: 5px 20px">
                    <v-btn icon style="margin-left: 25px">
                      {{ idea.likes }}<v-icon style="margin-left: 5px" color="red darken-2">
                        mdi-heart
                      </v-icon>
                    </v-btn>

                    <v-btn icon style="margin-left: 25px">
                      {{ idea.views }}<v-icon style="margin-left: 5px" color="blue darken-2">
                        mdi-eye
                      </v-icon>
                    </v-btn>
                  </v-card-actions>
                  <v-divider />
                  <v-card-actions>
                    <v-btn
                      color="orange lighten-2"
                      text
                    >
                      Description
                    </v-btn>

                    <v-spacer />

                    <v-btn
                      icon
                      @click="idea.show = !idea.show"
                    >
                      <v-icon>{{ idea.show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                    </v-btn>
                  </v-card-actions>

                  <v-expand-transition>
                    <div v-show="idea.show">
                      <v-divider />

                      <v-card-text>
                        {{ idea.description?idea.description:'No Description!' }}
                      </v-card-text>
                    </div>
                  </v-expand-transition>
                </v-card>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
        <div class="loading">
          <infinite-loading spinner="spiral" :identifier="mainLoader" @infinite="infiniteLoad">
            <div slot="no-more" />
            <div slot="no-more">
              No more
            </div>
            <div slot="no-results">
              {{ list.length===0?'no results':'' }}
            </div>
          </infinite-loading>
        </div>
      </v-card-text>

      <div style="flex: 1 1 auto;" />
    </v-card>
  </v-dialog>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading'
export default {
  name: 'PrankIdeaDialog',
  components: {
    InfiniteLoading
  },
  filters: {
    formatNumber (_value) {
      if (Math.abs(_value) > 999999) {
        return Math.sign(_value) * ((Math.abs(_value) / 1000000).toFixed(2)) + ' ' + 'M'
      } else if (Math.abs(_value) > 999) {
        return Math.sign(_value) * ((Math.abs(_value) / 1000).toFixed(2)) + ' ' + 'K'
      }
      return Math.sign(_value) * Math.abs(_value)
    }
  },
  props: {
    modal: {
      type: Boolean,
      required: true,
      default: false
    },
    category: {
      type: Object,
      required: false,
      default: () => {
        return {
          id: 0,
          name: '-',
          slug: '-',
          img_url: ''
        }
      }
    }
  },
  data () {
    return {
      loading: false,
      dialog: false,
      mainLoader: +new Date(),
      search: '',
      lastSearch: '',
      timer: null,
      list: [],
      pagination: {
        total: 0,
        count: 0,
        per_page: 8,
        current_page: 0,
        total_pages: 1
      }
    }
  },
  watch: {
    category (_new) {
      this.resetLoader()
    },
    modal (_new) {
      this.dialog = _new
    }
  },
  methods: {
    defaultData () {
      return this.$options.data.call(this)
    },
    closeDialog () {
      this.dialog = false
      this.$emit('close', true)
    },
    infiniteLoad ($state) {
      const _this = this
      if (_this.pagination.current_page >= _this.pagination.total_pages) {
        $state.complete()
        return
      }
      _this.fetchData($state)
    },

    getRequestLink () {
      return `prank-idea/${this.category.slug}?page=${(this.pagination.current_page + 1)}&limit=${this.pagination.per_page}&s=${this.search}`
    },
    async fetchData ($state) {
      const _this = this
      await this.$axiosCache.get(_this.getRequestLink()).then((response) => {
        if (response.status === 200) {
          response.data.data.forEach(function (item) {
            _this.processPushItem(item)
          })
          _this.pagination = response.data.pagination
          if (_this.pagination.current_page === _this.pagination.total_pages) {
            $state.complete()
          } else {
            $state.loaded()
          }
        } else {
          $state.complete()
        }
      })
    },
    processPushItem (_item) {
      _item.show = false
      this.list.push(_item)
    },
    resetLoader () {
      this.list = this.defaultData().list
      this.pagination = this.defaultData().pagination
      this.mainLoader++
    },
    inputChange () {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        if (this.search === this.lastSearch) { return }
        if (this.lastSearch.length >= 3 && this.search.length < 3) { this.resetLoader() }
        this.lastSearch = this.search
        if (this.search.length === 0 && this.lastSearch.length > 0) { this.resetLoader() }
        if (this.search.length < 3) { return }
        this.resetLoader()
      }, 400)
    }
  }
}
</script>

<style scoped>
.loading {
  padding: 30px;
  text-align: center;
}
</style>
