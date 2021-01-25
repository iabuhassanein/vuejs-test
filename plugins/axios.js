import { setupCache, setup } from 'axios-cache-adapter'
import Swal from 'sweetalert2'

const ONE_HOUR = 1000 * 60 * 60

// Create `axios-cache-adapter` instance
const cache = setupCache({
  maxAge: ONE_HOUR,
  ignoreCache: false,
  exclude: {
    query: false
  }
})

export default function ({ $axios }, inject) {
  function toaster (title, type = 'success', position = 'top-end', timer = 5000) {
    Swal.mixin({
      toast: true,
      position,
      showConfirmButton: false,
      timer
    }).fire({
      type,
      title
    })
  }

  const opts = Object.assign({}, $axios.defaults, {
    cache: {
      ignoreCache: false
    }
  })
  inject('axiosCache', setup(opts))
  $axios.defaults.adapter = cache.adapter
  $axios.onError((err) => {
    if (err.response === undefined) {
      toaster('Network Error!', 'error')
    } else if (err.response.status === 401) {
      // redirect('/logout')
    } else if (err.response.status === 404) {
      toaster('Page Not Found', 'error')
      // Do nothing
    } else if (err.response.status === 400) {
      let _msg = 'Unknown Error.'
      if (err.response.data) { _msg = err.response.data.message }
      toaster(_msg, 'warning')
    } else if (err.response.status === 422) {
      let errorsHtml = '<div class="row"><div class="col-12"></br><ul style="list-style-type: none;"><li><b>' + err.response.data.message + '</b></li>'
      // eslint-disable-next-line no-unused-vars
      for (const [key, value] of Object.entries(err.response.data.errors)) {
        errorsHtml += '<li>' + value + '</li>'
      }
      errorsHtml += '</ul></div></div>'
      toaster(errorsHtml, 'warning', 'center')
    } else if (err.response.data && err.response.data.message) {
      toaster(err.response.data.message, 'warning')
    } else if (err.code === 'ECONNABORTED') {
      toaster('Request Timeout!', 'error')
    } else {
      toaster('Unknown Error!', 'error')
    }
  })
}
