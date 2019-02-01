<template>
  <div class="main-content">
    <img v-bind:key="img" class="background" v-bind:src="source" alt>
    <div class="wisdom">
      <div class="quote">{{ quote }}</div>
      <div class="author">{{ author }}</div>
    </div>
    <div class="enlighten" v-on:click="enlighten">ENLIGHTEN ME</div>
  </div>
</template>

<script>
import { get } from "axios";

const fetchQuote = () => get("/api").then(({ data }) => data);

export default {
  data: function() {
    const height = Math.min(window.innerHeight, 1920)
    const width = Math.min(window.innerWidth, 1920)
    return {
      img: Date.now(), // image id for forced refresh
      source: `http://lorempixel.com/${width}/${height}` ,
      quote: "",
      author: ""
    };
  },
  created: function() {
    fetchQuote().then(({ quote, author }) => {
      this.quote = quote;
      this.author = "- " + author;
    });
  },
  methods: {
    enlighten: function() {
      this.img = Date.now(); // forces image to refresh
      this.quote = ""; // clear quote
      this.author = ""; // clear author
      fetchQuote().then(({ quote, author }) => {
        this.quote = quote;
        this.author = "- " + author;
      });
    }
  }
};
</script>
