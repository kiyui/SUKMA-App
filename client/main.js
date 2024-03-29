import { Blaze } from 'meteor/blaze'
import { Template } from 'meteor/templating'
import { Meteor } from 'meteor/meteor'

import '../node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js'

import './main.html'

const api = 'https://sukmasarawak2016.my/v1'

Meteor.startup(() => {
    // Containers
    const container = $('#container')
    const containerHome = $('#container-home')
    const containerHighlight = $('#container-highlight')
    const containerResults = $('#container-results')
    const containerSchedule = $('#container-schedule')
    const containerContingents = $('#container-contingents')
    const containerVenues = $('#container-venues')
    const containerGallery = $('#container-gallery')
    const containerVisiting = $('#container-visiting')

    // Navigation links
    const navHome = $('#nav_home')
    const navHighlight = $('#nav_news')
    const navResults = $('#nav_results')
    const navSchedule = $('#nav_schedule')
    const navContigents = $('#nav_contingents')
    const navVenues = $('#nav_venues')
    const navGallery = $('#nav_gallery')
    const navVisiting = $('#nav_visiting')

    const closeNav = () => $('#mobileNav').removeClass('in')

    const highlight_click = (e, t) => {
        const target = $(e.target)
        if (target.is('a')) {
            window.open(target.attr('href'), '_system')
        } else {
            const body = target.parents('.panel-body-container')
            const compress = body.find('.panel-body-compress')
            const full = body.find('.panel-body-full')

            if (compress.hasClass('in')) {
                compress.removeClass('in')
                full.addClass('in')
            } else {
                full.removeClass('in')
                compress.addClass('in')
            }
        }
    }

    const contingent_click = (e, t) => {
        const target = $(e.target)
        if (target.is('a')) {
            window.open(target.attr('href'), '_system')
        } else {
            const body = target.parents('.panel-body-container')
            const logo = body.find('.panel-body-logo')
            const full = body.find('.panel-body-full')
            const arrow = body.find('.panel-float-icon')

            if (full.hasClass('in')) {
                full.removeClass('in')
                arrow.removeClass('fa-rotate-180')
            } else {
                full.addClass('in')
                arrow.addClass('fa-rotate-180')
            }
        }
    }

    Template.gallery.helpers({
        destroy: () => {
            this.dom.remove()
        },
        configureHammer: () => {
            console.log('Configuring')
            return (hammer, t) => {
                hammer.get('pinch').set({
                    'enable': true
                })
                return hammer
            }
        },
        galleryGestures: {
            'pinchin img': (e, t) => {
                console.log('Triggered')
                const img = $(e.target)
                img.remove()
            }
        }
    })

    Template.gallery.events({
        'click img': (e, t) => {
            if (Meteor.isCordova) {
                cordova.plugins.fileOpener2.open(
                    $(e.target).attr('src'),
                    'image/jpg'
                )
            }
        }
    })

    Template.highlight_photo.events({
        'click .panel': highlight_click
    })

    Template.highlight.events({
        'click .panel': highlight_click
    })

    Template.contingent_photo.events({
        'click .panel': contingent_click
    })

    // Hide all contextual containers
    const hideContainers = () => $('.container-context').addClass('hidden')

    // Remove item instances
    const clear = (arg) => $(`#container-${arg}`).html('')

    // Returns current application context
    const context = () => container.data('context')

    // Update application states
    const update = {
        // Update synchronous lock state
        'unlocked': true,
        // Displays loading icon
        'loading': (enable) => {
            // TODO Create loading icon
            if (enable) {
                update.unlocked = false
                $('#btn-loading').removeClass('hidden')
            } else {
                update.unlocked = true
                $('#btn-loading').addClass('hidden')
            }
        },
        // Refreshes schedule
        'home': (url) => {
            update.loading(true)
            $.get(url, (response) => {
                Blaze.renderWithData(Template.home, response, containerHome[0])
                update.loading(false)
            })
        },
        // Refreshes highlights
        'highlight': (url) => {
            $.get(url, (response) => {
                const data = response.data

                // Set pagination urls
                containerHighlight.data('next', data.next_page_url)
                containerHighlight.data('prev', data.prev_page_url)

                // Render each instance of highlight
                data.data.forEach((highlight) => {
                    highlight.min = highlight.data.replace(/(<([^>]+)>)/ig,"").substring(0, 64)
                    if (highlight.photos.length > 0) {
                        highlight.photo = highlight.photos[0].url
                        Blaze.renderWithData(Template.highlight_photo, highlight, containerHighlight[0])
                    } else {
                        Blaze.renderWithData(Template.highlight, highlight, containerHighlight[0])
                    }
                })

                // Remove loading icon
                update.loading(false)
            })
        },
        // Refreshes schedule
        'schedule': (url) => {
            update.loading(true)
            $.get(url, (response) => {
                Blaze.renderWithData(Template.schedule, response, containerSchedule[0])
                update.loading(false)
            })
        },
        // Refreshes states
        'contingents': (url) => {
            update.loading(true)
            $.get(url, (response) => {
                const data = response.data

                // Render each instance of contingent
                data.forEach((state) => {
                    if (state.photo != "https://sukmasarawak2016.my/") {
                        Blaze.renderWithData(Template.contingent_photo, state, containerContingents[0])
                    } else {
                        Blaze.renderWithData(Template.contingent, state, containerContingents[0])
                    }
                })

                // Remove loading icon
                update.loading(false)
            })
        },
        // Refreshes venues
        'venues': (url) => {
            $.get(url, (response) => {
                const data = response.data

                // Render each instance of venue
                data.forEach((venue) => {
                    venue.photo = venue.photos[0].url
                    Blaze.renderWithData(Template.venue, venue, containerVenues[0])
                })

                // Remove loading icon
                update.loading(false)
            })
        },
        // Refreshes gallery
        'gallery': (url) => {
            $.get(url, (response) => {
                const data = response.data

                // Set pagination urls
                containerGallery.data('next', data.next_page_url)
                containerGallery.data('prev', data.prev_page_url)

                // Render each instance of photo
                data.data.forEach((image) => {
                    Blaze.renderWithData(Template.gallery, image, containerGallery[0])
                })

                // Remove loading icon
                update.loading(false)
            })
        }
    }

    // Sets current application context
    const contextSet = {
        'home': () => {
            clear('home')
            container.data('context', 'home')
            hideContainers()
            containerHome.removeClass('hidden')

            update.home(`${api}/state`)
        },
        'highlight': () => {
            clear('highlight')
            container.data('context', 'highlight')
            hideContainers()
            containerHighlight.removeClass('hidden')

            update.highlight(`${api}/highlight`)
        },
        'results': () => {
            container.data('context', 'results')
            hideContainers()
            containerResults.removeClass('hidden')
        },
        'schedule': () => {
            clear('schedule')
            container.data('context', 'schedule')
            hideContainers()
            containerSchedule.removeClass('hidden')

            update.schedule(`${api}/sport`)
        },
        'contingents': () => {
            clear('contingents')
            container.data('context', 'contingents')
            hideContainers()
            containerContingents.removeClass('hidden')

            update.contingents(`${api}/state`)
        },
        'venues': () => {
            clear('venues')
            container.data('context', 'venues')
            hideContainers()
            containerVenues.removeClass('hidden')

            update.venues(`${api}/venue`)
        },
        'gallery': () => {
            clear('gallery')
            container.data('context', 'gallery')
            hideContainers()
            containerGallery.removeClass('hidden')

            update.gallery(`${api}/photo`)
        },
        'visiting': () => {
            container.data('context', 'visiting')
            hideContainers()
            containerVisiting.removeClass('hidden')
        }
    }

    // Set navigation button actions
    navHome.click(() => closeNav() && contextSet.home())
    navHighlight.click(() => closeNav() && contextSet.highlight())
    navResults.click(() => closeNav() && contextSet.results())
    navSchedule.click(() => closeNav() && contextSet.schedule())
    navContigents.click(() => closeNav() && contextSet.contingents())
    navVenues.click(() => closeNav() && contextSet.venues())
    navGallery.click(() => closeNav() && contextSet.gallery())
    navVisiting.click(() => closeNav() && contextSet.visiting())

    $(window).scroll(() => {
        // Bottom
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            if (context() == "highlight") {
                // If there is more news
                if (containerHighlight.data('next') != null && update.unlocked) {
                    // Display loading icon
                    update.loading(true)
                    // Update news with next url
                    update.highlight(`${containerHighlight.data('next')}`)
                }
            } else if (context() == "gallery")
                // If there is more photos
                if (containerGallery.data('next') != null && update.unlocked) {
                    // Display loading icon
                    update.loading(true)
                    // Update news with next url
                    update.gallery(`${containerGallery.data('next')}`)
                }
        }
    })

    contextSet.home()
})
