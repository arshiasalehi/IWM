import { useEffect, useMemo, useState } from 'react'
import aboutMarkup from './about-page.html?raw'
import landingMarkup from './landing-page.html?raw'
import caseStudyMarkup from './case-study-page.html?raw'
import servicesMarkup from './services-page.html?raw'
import contactMarkup from './contact-page.html?raw'
import fleuristeImage from './assets/Fleuriste.png'
import galerieCaterArtVideo from './assets/Galerie Cater Art - Galerie Cater Art (720p, h264).mp4'
import lysAndLayoutImage from './assets/lys & layout.png'
import nailsStudioImage from './assets/NAILS STUDIO.png'

const BASE_URL = import.meta.env.BASE_URL || '/'
const BASE_PATH = BASE_URL === '/' ? '' : BASE_URL.replace(/\/$/, '')

const normalizePath = (pathname = '/') => {
  const normalized = pathname.replace(/\/+$/, '') || '/'

  if (BASE_PATH && normalized === BASE_PATH) {
    return '/'
  }

  if (BASE_PATH && normalized.startsWith(`${BASE_PATH}/`)) {
    return normalized.slice(BASE_PATH.length) || '/'
  }

  return normalized
}

const getRouteKey = (path) => {
  if (path === '/case-study' || path === '/case-studies' || path === '/work') {
    return 'work'
  }

  if (path === '/services' || path === '/service') {
    return 'services'
  }

  if (path === '/contact' || path === '/inquiry') {
    return 'contact'
  }

  if (path === '/about' || path === '/agency') {
    return 'about'
  }

  return 'home'
}

const toBaseAwareHref = (href) => {
  if (!href || !href.startsWith('/') || href.startsWith('//')) {
    return href
  }

  if (!BASE_PATH) {
    return href
  }

  if (href === '/') {
    return `${BASE_PATH}/`
  }

  if (href === BASE_PATH || href.startsWith(`${BASE_PATH}/`)) {
    return href
  }

  return `${BASE_PATH}${href}`
}

const addBasePathToLinks = (markup) =>
  markup.replace(/href="(\/[^"]*)"/g, (_, href) => `href="${toBaseAwareHref(href)}"`)

const addSelectedWorkMedia = (markup) =>
  markup
    .replaceAll('__WORK_VIDEO_1__', galerieCaterArtVideo)
    .replaceAll('__WORK_IMAGE_2__', lysAndLayoutImage)
    .replaceAll('__WORK_IMAGE_3__', nailsStudioImage)
    .replaceAll('__WORK_IMAGE_4__', fleuristeImage)

function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname))
  const routeKey = getRouteKey(currentPath)

  const pageMarkup =
    routeKey === 'about'
      ? aboutMarkup
      : routeKey === 'services'
        ? servicesMarkup
        : routeKey === 'contact'
          ? contactMarkup
          : routeKey === 'work'
            ? caseStudyMarkup
            : landingMarkup

  const renderedMarkup = useMemo(
    () => addSelectedWorkMedia(addBasePathToLinks(pageMarkup)),
    [pageMarkup],
  )

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    const currentRoute = getRouteKey(currentPath)

    const menuToggles = document.querySelectorAll('[data-menu-toggle]')
    const closeHandlers = []
    const menuCloseFns = []
    const effectCleanups = []

    const syncHeaderState = () => {
      const desktopLinks = document.querySelectorAll('header nav a')
      const mobileLinks = document.querySelectorAll('[data-mobile-menu] nav a')
      const headerCtas = document.querySelectorAll('header > div a[href*="/contact"]')

      desktopLinks.forEach((link) => {
        const linkPath = normalizePath(new URL(link.href, window.location.origin).pathname)
        const isActive = getRouteKey(linkPath) === currentRoute

        link.classList.toggle('text-primary', isActive)
        link.classList.toggle('underline', isActive)
        link.classList.toggle('underline-offset-8', isActive)
      })

      mobileLinks.forEach((link) => {
        const linkPath = normalizePath(new URL(link.href, window.location.origin).pathname)
        const isActive = getRouteKey(linkPath) === currentRoute

        link.classList.toggle('text-primary', isActive)
      })

      headerCtas.forEach((cta) => {
        cta.textContent = 'Start Project'
      })
    }

    const initSelectedWorksCarousel = () => {
      const section = document.querySelector('[data-selected-works]')

      if (!section) {
        return
      }

      const track = section.querySelector('[data-works-track]')
      const prevButton = section.querySelector('[data-works-prev]')
      const nextButton = section.querySelector('[data-works-next]')
      const progressFill = section.querySelector('[data-works-progress-fill]')
      const progressLabel = section.querySelector('[data-works-progress-label]')
      const cards = Array.from(section.querySelectorAll('[data-works-card]'))

      if (!track || !prevButton || !nextButton || cards.length === 0) {
        return
      }

      let activeIndex = 0
      let scrollRaf = null

      const formatIndex = (value) => String(value).padStart(2, '0')
      const maxIndex = cards.length - 1
      const getCardOffset = (index) => cards[index].offsetLeft - track.offsetLeft

      const updateControls = () => {
        const atStart = activeIndex === 0
        const atEnd = activeIndex === maxIndex

        prevButton.disabled = atStart
        nextButton.disabled = atEnd
        prevButton.classList.toggle('opacity-40', atStart)
        prevButton.classList.toggle('cursor-not-allowed', atStart)
        nextButton.classList.toggle('opacity-40', atEnd)
        nextButton.classList.toggle('cursor-not-allowed', atEnd)

        if (progressFill) {
          progressFill.style.width = `${((activeIndex + 1) / cards.length) * 100}%`
        }

        if (progressLabel) {
          progressLabel.textContent = `${formatIndex(activeIndex + 1)} / ${formatIndex(cards.length)}`
        }
      }

      const scrollToCard = (index) => {
        const clampedIndex = Math.max(0, Math.min(maxIndex, index))
        activeIndex = clampedIndex
        track.scrollTo({
          left: getCardOffset(clampedIndex),
          behavior: 'smooth',
        })
        updateControls()
      }

      const syncFromScroll = () => {
        const closestIndex = cards.reduce((bestIndex, _, index) => {
          const distance = Math.abs(getCardOffset(index) - track.scrollLeft)
          const bestDistance = Math.abs(getCardOffset(bestIndex) - track.scrollLeft)
          return distance < bestDistance ? index : bestIndex
        }, 0)

        if (closestIndex !== activeIndex) {
          activeIndex = closestIndex
          updateControls()
        }
      }

      const handleTrackScroll = () => {
        if (scrollRaf) {
          cancelAnimationFrame(scrollRaf)
        }

        scrollRaf = requestAnimationFrame(() => {
          syncFromScroll()
          scrollRaf = null
        })
      }

      const handlePrevClick = () => {
        scrollToCard(activeIndex - 1)
      }

      const handleNextClick = () => {
        scrollToCard(activeIndex + 1)
      }

      const handleResize = () => {
        track.scrollTo({ left: getCardOffset(activeIndex), behavior: 'auto' })
      }

      prevButton.addEventListener('click', handlePrevClick)
      nextButton.addEventListener('click', handleNextClick)
      track.addEventListener('scroll', handleTrackScroll, { passive: true })
      window.addEventListener('resize', handleResize)

      activeIndex = cards.reduce((bestIndex, _, index) => {
        const distance = Math.abs(getCardOffset(index) - track.scrollLeft)
        const bestDistance = Math.abs(getCardOffset(bestIndex) - track.scrollLeft)
        return distance < bestDistance ? index : bestIndex
      }, 0)
      updateControls()

      effectCleanups.push(() => {
        prevButton.removeEventListener('click', handlePrevClick)
        nextButton.removeEventListener('click', handleNextClick)
        track.removeEventListener('scroll', handleTrackScroll)
        window.removeEventListener('resize', handleResize)
        if (scrollRaf) {
          cancelAnimationFrame(scrollRaf)
        }
      })
    }

    menuToggles.forEach((toggle) => {
      const menuId = toggle.getAttribute('data-menu-toggle')
      const menu = menuId ? document.querySelector(`[data-mobile-menu="${menuId}"]`) : null

      if (!menu) {
        return
      }

      const closeTargets = menu.querySelectorAll('[data-menu-close], .mobile-menu-link')

      const openMenu = () => {
        menu.classList.remove('hidden')
        document.body.classList.add('mobile-menu-open')
        toggle.setAttribute('aria-expanded', 'true')
      }

      const closeMenu = () => {
        menu.classList.add('hidden')
        document.body.classList.remove('mobile-menu-open')
        toggle.setAttribute('aria-expanded', 'false')
      }

      menuCloseFns.push(closeMenu)

      const handleToggle = () => {
        if (menu.classList.contains('hidden')) {
          openMenu()
        } else {
          closeMenu()
        }
      }

      toggle.addEventListener('click', handleToggle)
      closeHandlers.push(() => toggle.removeEventListener('click', handleToggle))

      closeTargets.forEach((target) => {
        target.addEventListener('click', closeMenu)
        closeHandlers.push(() => target.removeEventListener('click', closeMenu))
      })
    })

    const handleInternalNavigation = (event) => {
      if (!(event.target instanceof Element)) {
        return
      }

      const link = event.target.closest('a[href]')

      if (!link || link.target === '_blank' || link.hasAttribute('download')) {
        return
      }

      const rawHref = link.getAttribute('href')

      if (
        !rawHref ||
        rawHref.startsWith('#') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:')
      ) {
        return
      }

      const url = new URL(link.href, window.location.origin)

      if (url.origin !== window.location.origin) {
        return
      }

      const targetPath = normalizePath(url.pathname)
      const currentSearchHash = `${window.location.search}${window.location.hash}`
      const targetSearchHash = `${url.search}${url.hash}`

      if (targetPath === currentPath && targetSearchHash === currentSearchHash) {
        return
      }

      event.preventDefault()

      menuCloseFns.forEach((closeMenu) => closeMenu())
      window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
      setCurrentPath(targetPath)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    syncHeaderState()
    initSelectedWorksCarousel()
    document.addEventListener('click', handleInternalNavigation)

    return () => {
      document.body.classList.remove('mobile-menu-open')
      document.removeEventListener('click', handleInternalNavigation)
      closeHandlers.forEach((cleanup) => cleanup())
      effectCleanups.forEach((cleanup) => cleanup())
    }
  }, [currentPath, renderedMarkup])

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: renderedMarkup,
      }}
    />
  )
}

export default App
