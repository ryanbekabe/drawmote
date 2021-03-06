<template>
  <div
    class="overlay pairing-desktop absolute flex"
    :style="transformOriginStyle"
    :class="{ 'is-desktop-animation': desktopAnimation }"
  >
    <div class="pairing-container">
      <h1 class="text-heavy h1">drawmote</h1>
      <p class="h2 text-bold mrgb+ text-muted">{{ $t('subtitle') }}</p>
      <p class="text-muted mrgt0 h3 pairing-lead">{{ $t('desktop.lead') }}</p>
      <div class="code code--desktop sm-mrgt md-mrgt+">
        <ServerStatus v-if="hasServerError" />
        <div v-else class="code__content">
          <div
            v-for="(number, index) in pairingCodeNumbers"
            :key="index"
            class="code__item"
            :class="{ visible: hasCode && introPlayed }"
          >
            <div class="code-circle contains" :class="'code-circle--' + number">
              <span>{{ number }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="pairing__actions mrgt">
        <p class="text-muted text-light mrgv0 pairing-skip">
          <button class="btn btn--bare" @click="skipPairing">
            {{ $t('desktop.nophone') }}
          </button>
        </p>
        <p
          v-if="isBlocked"
          class="text-muted text-light pairing-lead mrg0 text-brand"
        >
          {{ $t('desktop.tooManyAttempts') }}
        </p>
        <p
          class="code-timeout text-muted text-light mrg0"
          :class="{ visible: hasCode && countdown < 60 }"
        >
          <span
            >{{ $t('desktop.countdownPrefix') }}
            {{
              $tc('desktop.countdownSeconds', countdown, { count: countdown })
            }}
            {{ $t('desktop.countdownSuffix') }}</span
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import ServerStatus from '@/components/Common/ServerStatus.vue'

const PAIRING_TIMEOUT = 120
let interval = null
let transitionTimeout = null

export default {
  name: 'Pairing',

  components: {
    ServerStatus
  },

  props: {
    pairing: {
      type: Object,
      required: true
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    desktopAnimation: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      showModal: false,
      hasAppeared: false,
      showCode: false,
      countdown: PAIRING_TIMEOUT,
      center: { x: 0, y: 0 }
    }
  },

  computed: {
    ...mapState(['introPlayed']),
    ...mapGetters(['hasServerError']),

    pairingCodeNumbers: function() {
      if (this.isBlocked) {
        return new Array(6).fill('•')
      }

      if (this.hasCode) {
        return this.pairing.code.split('')
      }

      return new Array(6).fill(' ')
    },

    hasCode: function() {
      return (
        this.pairing &&
        this.pairing.code &&
        this.pairing.code.length > 0 &&
        this.showCode
      )
    },

    transformOriginStyle() {
      return {
        transformOrigin: `${this.center.x}px ${this.center.y}px`
      }
    }
  },

  watch: {
    pairing(pairing) {
      if (pairing) {
        this.startTimer()
      } else {
        this.stopTimer()
      }
    }
  },

  mounted() {
    window.clearTimeout(transitionTimeout)
    transitionTimeout = window.setTimeout(() => {
      this.showCode = true
    }, 1500)
  },

  beforeDestroy() {
    window.clearTimeout(transitionTimeout)
  },

  methods: {
    updateCenter(center) {
      this.center = center
    },

    skipPairing() {
      this.$store.dispatch('skip')
      this.$track('Pairing', 'skip', 1)
    },

    startTimer() {
      this.stopTimer()
      this.countdown = PAIRING_TIMEOUT

      interval = window.setInterval(() => {
        this.countdown--

        if (this.countdown <= 0) {
          this.$emit('pairingTimeout')
          this.stopTimer()
        }
      }, 1000)
    },

    stopTimer() {
      if (interval) {
        window.clearInterval(interval)
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/scss/components/_code.scss';

.pairing-desktop {
  overflow: hidden;
  padding: 2rem 3vw;
  padding-top: 84vw;
  justify-content: center;
  text-align: center;
  transform-origin: center center;
  &.is-desktop-animation {
    text-align: left;
    padding: 2rem 3vw;
    z-index: 800;
    align-items: center;
    width: 50%;
  }
  @include media('md') {
    padding: 0;
  }
  @include media('lg') {
    padding: 0;
  }
}

.pairing-container {
  padding-bottom: 7vh;
  position: relative;
}

.pairing__actions {
  @include media('md') {
    display: flex;
    align-items: center;
  }
}

.code--desktop {
  display: flex;
  justify-content: flex-start;
  .code__item {
    opacity: 0;
    transform: scale(1.3);
    transition: 0.55s cubic-bezier(0.79, -1.26, 0.21, 1.99);
    span {
      opacity: 0;
      transition: 0.4s cubic-bezier(0.64, 0.1, 0.61, 1.18);
      transform: scale(0.8);
    }
    .code-circle:before {
      transition: 0.5s cubic-bezier(0.57, -0.26, 0.24, 1.08);
      transform-origin: center;
      transform: scaleX(0);
    }
    @for $i from 1 through 6 {
      &:nth-child(#{$i}) {
        transition-delay: ($i / 8) * 1s;
        span {
          transition-delay: (($i / 8) * 1s) + 0.32s;
        }
        .code-circle:before {
          transition-delay: (($i / 8) * 1s) + 0.1s;
        }
      }
    }
    &.visible {
      &,
      span,
      .code-circle:before {
        opacity: 1;
        transform: none;
      }
    }
  }
}

.pairing-lead {
  max-width: 23rem;
  text-align: justify;
  @include media('md') {
    max-width: 29rem;
  }
  @include media('lg') {
    max-width: 35rem;
    margin: 0;
  }
}

.code-timeout {
  opacity: 0;
  transition: 0.3s;
  transition-delay: 0.3s;
  span {
    display: inline-block;
    vertical-align: middle;
  }
  &.visible {
    opacity: 1;
  }
}

.pairing-skip {
  margin-right: auto;
  &:hover {
    .btn {
      color: $brand-color;
    }
  }
}
</style>
