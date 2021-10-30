<template>
  <section id="home-landing-page">
    

      <v-container class="fill-height px-4 py-12">
        <v-responsive
            class="d-flex align-center"
            height="100%"
            max-width="700"
            width="100%"
        >
        </v-responsive>
      </v-container>
    
  </section>
</template>

<script>
  export default {
    name: 'SectionHomeLandingPage',
    provide: {
      theme: { isDark: true },
    },
    computed: {
      minHeight () {
        const height = this.$vuetify.breakpoint.mdAndUp ? '100vh' : '50vh'
        return `calc(${height} - ${this.$vuetify.application.top}px)`
      },
    },
  }
</script>
