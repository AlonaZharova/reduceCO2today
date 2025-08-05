document.addEventListener('DOMContentLoaded', () => {
  const tabs = [
    { label: 'World', link: '/' },
    { label: 'Germany', link: '/germany' },
    { label: 'UK', link: '/uk' },
    { label: 'About', link: '/about' },
    { label: ['Home ', 'Assistant'], link: '/homeassistant' },
    { label: 'API', link: '/api-registration' }
  ];

  const currentPath = window.location.pathname;
  let activeIndex = tabs.findIndex(t => t.link === currentPath);

  if (activeIndex === -1) {
    if (currentPath.includes('world')) {
      activeIndex = 0;
    } else if (currentPath.includes('uk')) {
      activeIndex = 2;  // UK is at index 2
    } else if (currentPath === '/tutorial1' || currentPath === '/tutorial2' || currentPath === '/tutorial3' || currentPath === '/tutorial4') {
      activeIndex = 4;  // Home Assistant is at index 4
    } else {
      activeIndex = 1;
    }
  }

  const tabElements = tabs.map((tab, i) => {
    const isActive = i === activeIndex;

    const labelContent = Array.isArray(tab.label)
      ? React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
              lineHeight: '1.2'
            }
          },
          ...tab.label.map((line, j) =>
            React.createElement('div', { key: j }, line)
          )
        )
      : tab.label;

    return React.createElement(
      'a',
      {
        href: tab.link,
        className: 'tab' + (isActive ? ' tab--active' : ''),
        style: {
          flex: '1',
          padding: '0 5px',
          height: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
          fontSize: '13px',
          fontWeight: isActive ? '700' : '400',
          textTransform: 'uppercase',
          textDecoration: 'none',
          userSelect: 'none',
          transition: 'color 0.3s ease'
        }
      },
      labelContent
    );
  });

  const tabsContainer = React.createElement(
    'div',
    {
      className: 'tabs',
      style: {
        position: 'relative',
        display: 'flex',
        height: '48px',
        width: '100%'
      }
    },
    ...tabElements,
    React.createElement('div', { className: 'tab-underline' })
  );

  const mountPoint = document.getElementById('react-nav');
  if (mountPoint) {
    ReactDOM.render(tabsContainer, mountPoint);

    // ⏳ Delay the measurement to ensure tabs are rendered
    requestAnimationFrame(() => {
      const el = mountPoint.querySelector('.tabs');
      const currentTab = el?.children?.[activeIndex];
      if (!currentTab) {
        console.warn('No current tab found at index:', activeIndex);
        return;
      }

      const tabsWidth = el.getBoundingClientRect().width;
      const currentTabWidth = currentTab.getBoundingClientRect().width;
      const right = ((currentTab.offsetLeft - 15) + currentTabWidth) * 100 / tabsWidth + '%';
      const left = (currentTab.offsetLeft + 15) * 100 / tabsWidth + '%';
      el.style.setProperty('--left-side', left);
      el.style.setProperty('--right-side', right);
    });
  }
});
