import Swal from 'sweetalert2'

export default ({ app }, inject) => {
  inject('toast', function (
    title,
    type = 'success',
    position = 'top-end',
    timer = 5000
  ) {
    return Swal.mixin({
      toast: true,
      position,
      showConfirmButton: false,
      timer
    }).fire({
      type,
      title
    })
  })

  inject('confirm', function (title, text, type) {
    return Swal.fire({
      title,
      text,
      type,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm'
    })
  })
  inject('swal', function () {
    return new Swal(...arguments)
  })
}
