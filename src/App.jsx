import { useEffect } from 'react'
import aboutMarkup from './about-page.html?raw'
import landingMarkup from './landing-page.html?raw'
import caseStudyMarkup from './case-study-page.html?raw'
import servicesMarkup from './services-page.html?raw'
import contactMarkup from './contact-page.html?raw'

function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
  const isCaseStudyPage =
    pathname === '/case-study' || pathname === '/case-studies' || pathname === '/work'
  const isServicesPage = pathname === '/services' || pathname === '/service'
  const isContactPage = pathname === '/contact' || pathname === '/inquiry'
  const isAboutPage = pathname === '/about' || pathname === '/agency'

  useEffect(() => {
    const menuToggles = document.querySelectorAll('[data-menu-toggle]')
    const closeHandlers = []

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

    return () => {
      document.body.classList.remove('mobile-menu-open')
      closeHandlers.forEach((cleanup) => cleanup())
    }
  }, [pathname])

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: isAboutPage
          ? aboutMarkup
          : isServicesPage
            ? servicesMarkup
            : isContactPage
              ? contactMarkup
              : isCaseStudyPage
                ? caseStudyMarkup
                : landingMarkup,
      }}
    />
  )
}

export default App
