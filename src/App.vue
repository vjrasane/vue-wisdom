<template>
  <div class="main-content">
    <img v-bind:key="img" class="background" src="http://lorempixel.com/g/1920/800" alt>
    <div class="wisdom">
      <div class="quote">{{ quote }}</div>
      <div class="author">{{ author }}</div>
    </div>
    <button class="enlighten" v-on:click="enlighten">ENLIGHTEN ME</button>
  </div>
</template>

<script>
import { get } from "axios";
import { sample, first } from "lodash";

const fetchQuote = () => get("/api").then(({ data }) => data);

export default {
  data: function() {
    return {
      img: Date.now(), // image id for forced refresh
      quote: "",
      author: ""
    };
  },
  created: function() {
    fetchQuote().then(({ quote, author }) => {
      this.quote = quote;
      this.author = "-" + author;
    });
  },
  methods: {
    enlighten: function() {
      this.img = Date.now(); // forces image to refresh
      this.quote = ""; // clear quote
      this.author = ""; // clear author
      fetchQuote().then(({ quote, author }) => {
        this.quote = quote;
        this.author = "-" + author;
      });
    }
  }
};
</script>
