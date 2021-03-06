import store from '@/store';

export default {
  install(Vue) {
    Vue.directive('permission', {
      update: function (el, binding) {
        if (!store.getters.elements[binding.value]) {
          el.parentNode.removeChild(el);
        }
      }
    })
  }
}