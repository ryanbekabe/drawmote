<template>
  <div class="mobile h-100">
    <transition name="component-fade">
      <component :is="visibleComponent">
        <Pairing v-if="!isConnected" />
      </component>
    </transition>
  </div>
</template>

<script>
import Pairing from '@/components/Mobile/Pairing.vue'
import Animation from '@/components/Common/Animation/Animation.vue'
import Controlling from '@/components/Mobile/Controlling.vue'

import { mapState } from 'vuex'
import { decodeEventMessage } from '@/tools/helpers'

export default {
  name: 'Mobile',

  components: {
    Pairing,
    Animation,
    Controlling
  },

  computed: {
    ...mapState(['isConnected']),

    visibleComponent() {
      return this.isConnected ? 'Controlling' : 'Animation'
    }
  },

  mounted() {
    this.$peersox.on('peerConnected', this.handleConnected.bind(this))
    this.$peersox.on('connectionClosed', this.handleConnectionClosed.bind(this))

    this.$mote.start()

    this.$peersox.onString = this.handleMessage.bind(this)
    this.$mote._onDataChange = this.handleDataChange.bind(this)
  },

  beforeDestroy() {
    this.$peersox.off('peerConnected', this.handleConnected)
    this.$peersox.off('connectionClosed', this.handleConnectionClosed)

    this.$peersox.onString = () => {}
    this.$mote._onDataChange = () => {}
  },

  methods: {
    handleConnected({ pairing }) {
      this.$store.dispatch('connect')
      this.$sentry.setUser(pairing.hash)
    },

    handleConnectionClosed() {
      this.$store.dispatch('disconnect')
      this.$mote.stop()
    },

    handleMessage(rawMessage) {
      if (!this.isConnected) {
        return
      }

      const { event, data } = decodeEventMessage(rawMessage)

      if (event === 'viewport') {
        this.$mote.updateScreenViewport(data)
      }

      if (event === 'distance') {
        this.$mote.updateScreenDistance(data)
      }
    },

    handleDataChange(data) {
      if (this.isConnected) {
        this.$peersox.send(data)
      }
    }
  }
}
</script>
