const { createApp } = Vue;

createApp({
  data() {
    return {
      currentTab: "shows",
      searchBox: "",
      filterBox: "all",
      loading: false,
      errorState: false,
      currentList: [],
      modalOpen: false,
      selectedItem: null,

      // [value, text shown]
      filterOptions: {
        shows: [
          ["all", "All Genres"],
          ["Drama", "Drama"],
          ["Comedy", "Comedy"],
          ["Action", "Action"],
          ["Science-Fiction", "Sci-Fi"],
          ["Thriller", "Thriller"]
        ]
      },

      titles: {
        shows: ["Movie & TV Show Explorer", "Primary API: TVMaze API"],
        trivia: ["Entertainment & Movie Trivia", "2nd API: Open Trivia Database"],
        animals: ["Studio Mascot Intermission", "3rd API: The Cat API"],
        predictor: ["Character Name Predictor", "4th API: Agify API"]
      }
    };
  },

  methods: {
    // Change tab
    changeTab(tab) {
      this.currentTab = tab;
      this.searchBox = "";
      this.filterBox = "all";
      this.loadData();
    },

    // Load data from the API of the current tab
    async loadData() {
      this.loading = true;
      this.errorState = false;
      this.currentList = [];

      try {
        if (this.currentTab === "shows") {
          // API 1: TVMaze API
          var query = this.searchBox.trim() !== "" ? this.searchBox : "batman";
          var url = "https://api.tvmaze.com/search/shows?q=" + encodeURIComponent(query);
          var response = await fetch(url);
          if (!response.ok) throw new Error("TVMaze API error");
          var data = await response.json();

          // each item looks like { score, show }, so we take only the show
          var shows = data.map(item => item.show);

          // filter by genre
          if (this.filterBox !== "all") {
            shows = shows.filter(show => show.genres.includes(this.filterBox));
          }
          this.currentList = shows;

        } else if (this.currentTab === "trivia") {
          // API 2: Open Trivia Database (category 11 = Film)
          var url = "https://opentdb.com/api.php?amount=10&category=11&type=multiple";
          var response = await fetch(url);
          if (!response.ok) throw new Error("Trivia API error");
          var data = await response.json();

          // response_code 0 = success (5 = too many requests, wait 5 seconds)
          if (data.response_code !== 0) throw new Error("Trivia code " + data.response_code);
          this.currentList = data.results;

        } else if (this.currentTab === "animals") {
          // API 3: The Cat API
          var url = "https://api.thecatapi.com/v1/images/search?limit=8";
          var response = await fetch(url);
          if (!response.ok) throw new Error("Cat API error");
          this.currentList = await response.json();

        } else if (this.currentTab === "predictor") {
          // API 4: Agify API
          var nameQuery = this.searchBox.trim() !== "" ? this.searchBox : "michael";
          var url = "https://api.agify.io/?name=" + encodeURIComponent(nameQuery);
          var response = await fetch(url);
          if (!response.ok) throw new Error("Agify API error");
          var data = await response.json();
          this.currentList = [data]; // put the single result inside a list
        }

      } catch (error) {
        console.error(error);
        this.errorState = true;
      } finally {
        this.loading = false;
      }
    },

    // Open the details popup
    showDetails(show) {
      this.selectedItem = show;
      this.modalOpen = true;
    },

    // Close the details popup
    closeModal() {
      this.modalOpen = false;
      this.selectedItem = null;
    }
  },

  // Runs when the page first opens
  mounted() {
    this.loadData();
  }
}).mount("#app");