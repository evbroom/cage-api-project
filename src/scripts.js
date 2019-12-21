const cageApp = {};

cageApp.apiKey = '313b13f979a58204cdf30015ab28d33a';
cageApp.cageId = '2963';
cageApp.baseApiUrl = 'https://api.themoviedb.org/3/';

cageApp.init = function () {
    cageApp.getCageMovies();
    cageApp.events();
};


// get a list of Nic Cage's movies based on his credits (limited to 40 based on ajax request limits)
cageApp.getCageMovies = function () {
    cageApp.searchMovie = $.ajax({
        url: `${cageApp.baseApiUrl}person/${cageApp.cageId}/movie_credits`,
        method: 'GET',
        dataType: 'json',
        data: {
            api_key: cageApp.apiKey
        }
    })
        .then(function (movieIds) {
            // slice off the total number of ids to prevent going over the API's request limit
            cageApp.getMovieIds(movieIds.cast.slice(0, 39))
        });
};

// get the movie id's specific to Nick Cage's movies
cageApp.getMovieIds = function (cageMovies) {
    var movieIds = []
    cageMovies.forEach((cageMovie) => {
        movieIds.push(cageMovie.id);
    })
    cageApp.getMovieById(movieIds)
};

// get more specific movie details of Nick Cage's movies
cageApp.getMovieById = function (movieIds) {
    const movies = movieIds.map(movie => {
        return $.ajax({
            url: 'https://proxy.hackeryou.com',
            dataType: 'json',
            method: 'GET',
            data: {
                reqUrl: `${cageApp.baseApiUrl}movie/${movie}`,
                params: {
                    api_key: cageApp.apiKey,
                    adult: false,
                    original_language: 'en',
                    include_image_language: 'en,null'
                },
                useCache: true
            }
        });
    });
    $.when(...movies)
        .then((...finalMovies) => {
            cageApp.finalMovies = finalMovies.map(movie => movie[0]);
        });
};


cageApp.events = function () {
    cageApp.clickHeader();
    cageApp.displayCage();
    cageApp.submitForm();
    cageApp.hideSections();
    cageApp.showDefaultGif();
    cageApp.smoothScroll();
};

// get a top and bottom number to compare against user input

cageApp.convertStringToNumber = function (usersChoice) {
    // refactor this
    if (usersChoice === '0.5') {
        const bottomChoice = 4;
        const topChoice = bottomChoice + 0.5;
        cageApp.filterResults(topChoice, bottomChoice)
    } else if (usersChoice === '1') {
        const bottomChoice = 5;
        const topChoice = bottomChoice + 0.5;
        cageApp.filterResults(topChoice, bottomChoice)
    } else if (usersChoice === '1.5') {
        const bottomChoice = 6;
        const topChoice = bottomChoice + 0.5;
        cageApp.filterResults(topChoice, bottomChoice)
    } else {
        const bottomChoice = 7;
        const topChoice = bottomChoice + 1;
        cageApp.filterResults(topChoice, bottomChoice)
    };
};

// filter user results based on input and movie popularity and return one single movie (randomized)

// **It seems as though the popularity property fluctuates in value more than I thought. I'm going to update the site to filter based on the vote average property.
cageApp.filterResults = function (topChoice, bottomChoice) {
    // return values between the two choices

    let selectedMovies = cageApp.finalMovies.filter(function (el) {
        return (el.vote_average < topChoice && el.vote_average > bottomChoice);
    })
    cageApp.displaySelectedMovie(_.sample(selectedMovies));
};

cageApp.displaySelectedMovie = function (movieResult) {
    $('.movieResult').remove();
    $('.movieInfo').remove();
    const movieContainer = $('<div>').addClass('movieResult');
    const movieDescription = $('<div>').addClass('movieInfo');
    const moviePoster = $('<img>').addClass('moviePoster').attr('src', `https://image.tmdb.org/t/p/w300${movieResult.poster_path}`)
    const movieOverview = $('<p>').addClass('movieDescription').text(movieResult.overview);
    const movieTitle = $('<h3>').addClass('movieTitle').text(movieResult.original_title);
    const movieLink = $('<a>').addClass('movieLink').attr('href', `http://www.imdb.com/title/${movieResult.imdb_id}`).attr('target', '_blank').text('IMDB Link');

    // order matters here
    movieContainer.append(moviePoster);
    movieDescription.append(movieTitle, movieOverview, movieLink);
    $('#result').append(movieContainer);
    $('#movieDescription').append(movieDescription);
}

cageApp.displayCage = function () {
    $('.cageBlock').hide();
    $('#cageForm').on('input change', '#cageRange', function () {
        let sliderValue = $(this).val();
        $('.cageBlock').hide();
        if (sliderValue === '0.5') {
            $('.one').show();
        } else if (sliderValue === '1') {
            $('.two').show();
        } else if (sliderValue === '1.5') {
            $('.three').show();
        } else {
            $('.four').show();
        };
    });
}

// get the user's choice (based on movie's popularity) from the form and store it in a usersChoice variable
// pass the variable to a convert string to number function
cageApp.submitForm = function () {
    $('form').on('submit', function (e) {
        e.preventDefault();
        let usersChoice = $('#cageRange').val();
        cageApp.convertStringToNumber(usersChoice);
        $('html, body').animate({
            scrollTop: $('.results').offset().top
        }, 1000);
    })
}

// easter egg that changes the h1 tag on click
cageApp.clickHeader = function () {
    $('.top-heading').click(function () {
        $('#casi').toggleClass('lightenText');
        $('.cageSpan').toggleClass('perma');
        $('.spinning-nic').toggleClass('spin');

    });
};

cageApp.hideSections = function () {
    $('.pickNic').click(function () {
        $('.four').show();
    })
};

cageApp.smoothScroll = function () {
$(document).on('click touchstart', 'a[href^="#"]', function (event) {
		event.preventDefault();
		var targetId = $(this).attr('href');
		var position = $(targetId).offset().top;
		$('body, html').animate({ scrollTop: position }, 1500);
	});
}

cageApp.showDefaultGif = () => $('.four').show();

$(function () {
    cageApp.init();
})
