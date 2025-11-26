
import React from 'react';

const PuzzlePieceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.597.484-1.08 1.08-1.08h.008c.597 0 1.08.483 1.08 1.08v.008c0 .597-.483 1.08-1.08 1.08h-.008a1.08 1.08 0 01-1.08-1.08v-.008z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9.75 0h.008v.008H10.5v-.008zM3 15.75l5.25-11.25L13.5 15.75m-8.25 0h.008v.008H5.25v-.008zM9.75 15.75l3-6.429 3 6.429m-6 0h.008v.008H9.75v-.008z" />
  </svg>
);

export default PuzzlePieceIcon;
