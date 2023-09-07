function transitionToNavBar() {
    var navigationBar = document.getElementById("navigation-bar");

    // if (!navigationBar.classList.contains("active")) {
    //     // Expand the navigation bar
        navigationBar.classList.add("active");
    // } else {
    //     // Shrink the navigation bar
    //     navigationBar.classList.remove("active");
    // }
}

function transitionToSplash() {
    var navigationBar = document.getElementById("navigation-bar");

    // if (!navigationBar.classList.contains("active")) {
    //     // Expand the navigation bar
    //    navigationBar.classList.add("active");
    // } else {
    //     // Shrink the navigation bar
         navigationBar.classList.remove("active");
    // }
}

function typeWords(words) {
    let index = 0;
    let currentWord = words[index];
    let wordContainer = document.getElementById('word-container'); // Assuming there's an HTML element with id 'word-container' where the words will be displayed
  
    function typeWord() {
      let currentLetterIndex = 0;
      let currentLetter = currentWord[currentLetterIndex];
      let typingInterval = setInterval(function() {
        wordContainer.textContent += currentLetter;
  
        currentLetterIndex++;
        if (currentLetterIndex === currentWord.length) {
        clearInterval(typingInterval);
        setTimeout(deleteWord, 2000);
        } else {
        currentLetter = currentWord[currentLetterIndex];
        }
    }, 100);
    }
  
    function deleteWord() {
      let currentLetterIndex = currentWord.length - 1;
      let deletingInterval = setInterval(function() {
        wordContainer.textContent = wordContainer.textContent.slice(0, -1);
        currentLetterIndex--;
        if (currentLetterIndex < 0) {
          clearInterval(deletingInterval);
          setTimeout(typeNextWord, 1000);
        }
      }, 100);
    }
  
    function typeNextWord() {
      wordContainer.textContent = '';
      index++;
    //   if (index === words.length) {
    //     index = 0; // Loop back to the first word if all words have been typed
    //   }
      currentWord = words[index];
      setTimeout(typeWord, 1000);
    }
  
    typeWord();
  }
  