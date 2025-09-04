import React, {useState, useMemo, useEffect} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import {
  BlogSidebarItemList,
  groupBlogSidebarItemsByYear,
  useVisibleBlogSidebarItems,
} from '@docusaurus/plugin-content-blog/client';
import type {BlogSidebar, BlogSidebarItem} from '@docusaurus/plugin-content-blog';
import {createStorageSlot} from '@docusaurus/theme-common';

interface BlogSidebarProps {
  sidebar: BlogSidebar;
}

function groupByMonth(items: BlogSidebarItem[]): [string, BlogSidebarItem[]][] {
  const byMonth = new Map<string, BlogSidebarItem[]>();
  items.forEach((item) => {
    const d = new Date(item.date);
    const month = d.toLocaleString('default', {month: 'long'});
    const arr = byMonth.get(month) ?? [];
    arr.push(item);
    byMonth.set(month, arr);
  });
  const orderedMonths = [
    'January','February','March','April','May','June','July','August','September','October','November','December',
  ];
  const entries: [string, BlogSidebarItem[]][] = Array.from(byMonth.entries());
  entries.sort((a, b) => orderedMonths.indexOf(b[0]) - orderedMonths.indexOf(a[0]));
  return entries;
}

const yearsSlot = createStorageSlot('blogSidebar.expandedYears');
const monthsSlot = createStorageSlot('blogSidebar.expandedMonths');

export default function BlogSidebar({sidebar}: BlogSidebarProps): JSX.Element | null {
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const items = sidebar?.items ?? [];
  const visibleItems = useVisibleBlogSidebarItems(items);
  const groupedByYear = groupBlogSidebarItemsByYear(visibleItems);

  // Precompute months per year (avoid hooks in loops)
  const monthsByYear = useMemo(() => {
    const map = new Map<string, [string, BlogSidebarItem[]][]>();
    groupedByYear.forEach(([year, yearItems]) => {
      map.set(year, groupByMonth(yearItems));
    });
    return map;
  }, [groupedByYear]);

  useEffect(() => {
    const storedYears = yearsSlot.get();
    const storedMonths = monthsSlot.get();
    if (storedYears || storedMonths) {
      setExpandedYears(new Set(storedYears?.split(',').filter(Boolean)));
      setExpandedMonths(new Set(storedMonths?.split(',').filter(Boolean)));
      return;
    }
    const now = new Date();
    const currentYear = String(now.getFullYear());
    const currentMonth = now.toLocaleString('default', {month: 'long'});
    const monthKey = `${currentYear}-${currentMonth}`;
    setExpandedYears(new Set([currentYear]));
    setExpandedMonths(new Set([monthKey]));
  }, []);

  useEffect(() => {
    yearsSlot.set(Array.from(expandedYears).join(','));
  }, [expandedYears]);
  useEffect(() => {
    monthsSlot.set(Array.from(expandedMonths).join(','));
  }, [expandedMonths]);

  if (!visibleItems || visibleItems.length === 0) {
    return null;
  }

  const toggleYear = (year: string) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year); else next.add(year);
      return next;
    });
  };

  const toggleMonth = (year: string, month: string) => {
    const key = `${year}-${month}`;
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <aside className="col col--3">
      <nav className={clsx(styles.sidebar, 'thin-scrollbar')} aria-label="Blog recent posts navigation">
        {sidebar.title && (
          <div className={clsx(styles.sidebarItemTitle, 'margin-bottom--md')}>
            {sidebar.title}
          </div>
        )}
        <ul className={clsx(styles.sidebarItemList, 'clean-list')}>
          {groupedByYear.map(([year]) => {
            const isYearExpanded = expandedYears.has(year);
            const months = monthsByYear.get(year) ?? [];
            return (
              <li key={year} className={styles.sidebarItem}>
                <button
                  type="button"
                  className={clsx('clean-btn', styles.yearTitle)}
                  onClick={() => toggleYear(year)}
                  aria-expanded={isYearExpanded}
                >
                  {year}
                </button>
                {isYearExpanded && (
                  <ul className={clsx(styles.sidebarItemList, 'clean-list', styles.monthList)}>
                    {months.map(([month, monthItems]) => {
                      const monthKey = `${year}-${month}`;
                      const isMonthExpanded = expandedMonths.has(monthKey);
                      return (
                        <li key={monthKey} className={styles.sidebarItem}>
                          <button
                            type="button"
                            className={clsx('clean-btn', styles.monthTitle)}
                            onClick={() => toggleMonth(year, month)}
                            aria-expanded={isMonthExpanded}
                          >
                            {month}
                          </button>
                          {isMonthExpanded && (
                            <BlogSidebarItemList
                              items={monthItems}
                              ulClassName={clsx(styles.sidebarItemList, 'clean-list', styles.postList)}
                              liClassName={styles.sidebarItem}
                              linkClassName={styles.sidebarItemLink}
                              linkActiveClassName={styles.sidebarItemLinkActive}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}


