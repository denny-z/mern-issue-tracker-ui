import React from 'react';
import { Pagination } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import URLSearchParams from 'url-search-params';

const SECTION_SIZE = 5;

function PageLink({
  params, page, activePage, children,
}) {
  params.set('page', page);
  if (page === 0) return React.cloneElement(children, { disabled: true });
  return (
    <LinkContainer
      isActive={() => page === activePage}
      to={{ search: `?${params.toString()}` }}
    >
      {children}
    </LinkContainer>
  );
}

export default function PagintationWithSections({ search, totalPages }) {
  const params = new URLSearchParams(search);
  let activePage = parseInt(params.get('page'), 10);
  if (Number.isNaN(activePage)) activePage = 1;

  const startPageInSection = Math.floor((activePage - 1) / SECTION_SIZE) * SECTION_SIZE + 1;
  const endPageInSection = startPageInSection + SECTION_SIZE - 1;
  const prevSectionPage = startPageInSection === 1 ? 0 : startPageInSection - SECTION_SIZE;
  const nextSectionPage = endPageInSection >= totalPages ? 0 : startPageInSection + SECTION_SIZE;

  const pageLinks = [];
  for (let i = startPageInSection; i <= Math.min(totalPages, endPageInSection); i += 1) {
    params.set('page', 1);
    pageLinks.push(
      <PageLink key={i} params={params} activePage={activePage} page={i}>
        <Pagination.Item>{i}</Pagination.Item>
      </PageLink>,
    );
  }

  return (
    <>
      <Pagination>
        <PageLink params={params} page={prevSectionPage}>
          <Pagination.Item>{'<'}</Pagination.Item>
        </PageLink>
        {pageLinks}
        <PageLink params={params} page={nextSectionPage}>
          <Pagination.Item>{'>'}</Pagination.Item>
        </PageLink>
      </Pagination>
    </>
  );
}
