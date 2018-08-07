import * as React from 'react'
import { style } from 'typestyle'
import { StatelessComponent } from 'react'

const ArrowDownIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M3.907 12.192l6.058 6.058a.773.773 0 0 0 1.07 0l6.058-6.058a.757.757 0 0 0-1.07-1.071l-4.766 4.765V3.292a.757.757 0 0 0-1.514 0v12.594L4.977 11.12a.757.757 0 1 0-1.07 1.07z" />
  </svg>
)

const ArrowUpIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M17.084 8.809l-6.058-6.06a.773.773 0 0 0-1.07 0L3.898 8.81a.757.757 0 0 0 1.07 1.07l4.766-4.764v12.593a.757.757 0 1 0 1.514 0V5.115l4.765 4.766a.757.757 0 0 0 1.071-1.071v-.001z" />
  </svg>
)

const CodeViewIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M7.525 17.472h-4.43V3.528h4.43a.89.89 0 0 0 .904-.875.89.89 0 0 0-.904-.875H2.25a.89.89 0 0 0-.904.875.794.794 0 0 0 .019.093.869.869 0 0 0-.02.099V18.12a.878.878 0 0 0 .024.117.792.792 0 0 0-.023.11.89.89 0 0 0 .904.875h5.275a.875.875 0 1 0 0-1.75zm5.95-13.944h4.43v13.944h-4.43a.875.875 0 1 0 0 1.75h5.275a.89.89 0 0 0 .904-.875.794.794 0 0 0-.019-.093.869.869 0 0 0 .02-.099V2.88a.878.878 0 0 0-.024-.117.792.792 0 0 0 .023-.11.89.89 0 0 0-.904-.875h-5.275a.89.89 0 0 0-.904.875.89.89 0 0 0 .904.875z" />
    <path d="M15.701 9.982l-3.327-3.327a.749.749 0 0 0-1.034 0 .733.733 0 0 0 0 1.034l2.81 2.811-2.81 2.81a.731.731 0 0 0 1.035 1.035l3.328-3.328a.73.73 0 0 0-.002-1.035zM9.518 6.655a.749.749 0 0 0-1.034 0L5.157 9.982a.73.73 0 0 0 0 1.036l3.327 3.327a.731.731 0 0 0 1.034-1.035l-2.81-2.81 2.81-2.81a.733.733 0 0 0 0-1.035z" />
  </svg>
)

const DeleteDocumentIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M18.412 11.543a.862.862 0 1 0-1.722 0v6.429H4.31V3.028h4.293a.875.875 0 1 0 0-1.75H3.478a.882.882 0 0 0-.89.875.806.806 0 0 0 .019.093.881.881 0 0 0-.019.099V18.62a.891.891 0 0 0 .022.117.804.804 0 0 0-.022.11.882.882 0 0 0 .89.875h14.044l.015-.003.014.003a.823.823 0 0 0 .542-.217c.02-.017.044-.026.062-.044s.026-.043.042-.062a.852.852 0 0 0 .215-.552l-.003-.014.003-.015v-7.275z" />
    <path d="M17.111 1.853l-2.16 2.127-2.126-2.16a.765.765 0 1 0-1.09 1.073l2.126 2.16-2.16 2.126a.765.765 0 0 0 1.074 1.09l2.16-2.127 2.126 2.16a.764.764 0 1 0 1.09-1.073l-2.127-2.16 2.16-2.126a.765.765 0 0 0-1.073-1.09z" />
  </svg>
)

const EditDocumentIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M18.412 9.646a.862.862 0 1 0-1.722 0v8.43H4.31V3.131h5.293a.875.875 0 1 0 0-1.75H3.478a.882.882 0 0 0-.89.875.806.806 0 0 0 .019.092.881.881 0 0 0-.019.1v16.274a.891.891 0 0 0 .022.118.804.804 0 0 0-.022.11.882.882 0 0 0 .89.875h14.044l.015-.003.014.003a.823.823 0 0 0 .542-.218c.02-.016.044-.026.062-.044s.026-.042.042-.062a.852.852 0 0 0 .215-.551l-.003-.015.003-.015V9.646z" />
    <path d="M17.934 1.402a.89.89 0 0 0-1.257.069l-6.666 7.267a.903.903 0 0 0-.137.22l-.01-.007-.028.069-.018.045-.929 2.334 2.066-1.247a.911.911 0 0 0 .19-.115l.1-.06-.009-.006c.018-.017.042-.025.059-.043L17.96 2.66a.89.89 0 0 0-.027-1.258z" />
  </svg>
)

const FilterListIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M19.1 6.7H1.9c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h17.3c.5 0 .9.4.9.9s-.5.9-1 .9zm-2.5 4.6H4.4c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h12.3c.5 0 .9.4.9.9s-.5.9-1 .9zm-3.5 4.8H7.9c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h5.3c.5 0 .9.4.9.9s-.5.9-1 .9z" />
  </svg>
)

const FilterAscendingIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M19.1 6.7H1.9c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h17.3c.5 0 .9.4.9.9s-.5.9-1 .9zm-5 4.6H1.9c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h12.3c.5 0 .9.4.9.9s-.5.9-1 .9zm-7 4.8H1.9c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h5.3c.5 0 .9.4.9.9s-.5.9-1 .9z" />
  </svg>
)

const FilterDescendingIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M20 15.2c0 .5-.4.9-.9.9H1.9c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h17.3c.4 0 .8.4.8.9zm-5-4.6c0 .5-.4.9-.9.9H1.9c-.5-.1-.9-.5-.9-.9 0-.5.4-.9.9-.9h12.3c.4 0 .8.4.8.9zM7.1 4.9c.5 0 .9.4.9.9s-.4.9-.9.9H1.9c-.5 0-.9-.4-.9-.9s.4-.9.9-.9h5.2z" />
  </svg>
)

const FormatBoldIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M12.424 10.145a3.019 3.019 0 0 0 1.557-.921 2.926 2.926 0 0 0 .668-1.967 2.829 2.829 0 0 0-1.198-2.521 6.99 6.99 0 0 0-3.77-.786H6.926v.027a.8.8 0 0 0-.13-.027.89.89 0 0 0-.876.904V16.13a.89.89 0 0 0 .875.905.8.8 0 0 0 .131-.028v.044h3.608a5.1 5.1 0 0 0 3.336-.996 3.438 3.438 0 0 0 1.21-2.785 3.002 3.002 0 0 0-2.656-3.124zM9.743 5.492a4.742 4.742 0 0 1 2.395.46 1.564 1.564 0 0 1 .714 1.454 1.81 1.81 0 0 1-.642 1.573 3.916 3.916 0 0 1-2.204.473H7.67v-3.96h2.073zm2.75 9.457a3.719 3.719 0 0 1-2.266.576H7.67v-4.557h2.433a4.202 4.202 0 0 1 2.376.54 1.863 1.863 0 0 1 .751 1.655 2.114 2.114 0 0 1-.738 1.786z" />
  </svg>
)

const FormatItalicIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M14.245 4.068H8.97a.821.821 0 0 0-.904.698.821.821 0 0 0 .904.697h1.731L8.564 15.537h-1.81a.821.821 0 0 0-.903.697.821.821 0 0 0 .904.698h5.275a.821.821 0 0 0 .904-.698.821.821 0 0 0-.904-.697h-1.682l2.137-10.074h1.76a.821.821 0 0 0 .904-.697.821.821 0 0 0-.904-.698z" />
  </svg>
)

const FormatStrikethroughIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M17.637 11.072H3.363a.814.814 0 0 1-.905-.672.814.814 0 0 1 .905-.672h14.274a.814.814 0 0 1 .905.672.814.814 0 0 1-.905.671zm-5.753 1.036a2.775 2.775 0 0 1 1.09 1.945 1.657 1.657 0 0 1-.684 1.376 2.889 2.889 0 0 1-1.824.549A2.315 2.315 0 0 1 7.83 13.97l-.06-.334-2.155 1.193.07.176c.552 1.387 1.81 2.09 3.74 2.09a6.517 6.517 0 0 0 3.9-1.131 3.461 3.461 0 0 0 1.595-2.89 2.668 2.668 0 0 0-.192-.967h-2.843zm-.707-3.432a10.529 10.529 0 0 1-1.201-1.062 1.575 1.575 0 0 1-.457-1.058c0-.651.213-1.516 2.055-1.516a3.195 3.195 0 0 1 1.573.353.9.9 0 0 1 .57.764 2.182 2.182 0 0 1-.155.674l-.056.16.149.098a.752.752 0 0 0 1.146-.47l.912-1.91-.203-.099a6.893 6.893 0 0 0-3.058-.707 5.533 5.533 0 0 0-3.39 1.008A3.135 3.135 0 0 0 7.691 7.51a2.436 2.436 0 0 0 .29 1.166h3.197z" />
  </svg>
)

const FormatUnderlineIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M14.053 3.531a.902.902 0 0 0-.899.905v5.04a3.396 3.396 0 0 1-.673 2.272 2.446 2.446 0 0 1-1.947.777 2.54 2.54 0 0 1-2.016-.773 3.365 3.365 0 0 1-.672-2.259V4.436a.9.9 0 1 0-1.799 0V9.71a.865.865 0 0 0 .032.157 5.284 5.284 0 0 0 1.125 3.21 4.06 4.06 0 0 0 3.248 1.356 4.222 4.222 0 0 0 3.291-1.342 5.109 5.109 0 0 0 1.18-3.23.859.859 0 0 0 .03-.152V4.436a.902.902 0 0 0-.9-.905zm3.584 13.937H3.363a.789.789 0 1 1 0-1.56h14.274a.789.789 0 1 1 0 1.56z" />
  </svg>
)

const FormatUnorderedListIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M6.112 6.719h13.273a.875.875 0 0 0 0-1.75H6.112a.875.875 0 0 0 0 1.75zm13.274 2.875H6.112a.875.875 0 0 0 0 1.75h13.273a.875.875 0 0 0 0-1.75h.001zm0 4.75H6.112a.875.875 0 0 0 0 1.75h13.273a.875.875 0 0 0 0-1.75h.001z" />
    <circle cx="2.115" cy="5.781" r="1.375" />
    <circle cx="2.115" cy="10.469" r="1.375" />
    <circle cx="2.115" cy="15.219" r="1.375" />
  </svg>
)

const InsertLinkIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M17.955 5.28a3.82 3.82 0 0 0-2.854-2.407c-.111-.026-.224-.042-.336-.063h-.54a.665.665 0 0 1-.1.026 2.96 2.96 0 0 0-1.242.415 8.468 8.468 0 0 0-1.77 1.633.82.82 0 0 0-.087.934.947.947 0 0 0 1.556.252c.307-.295.606-.598.907-.898a1.42 1.42 0 0 1 .686-.41 1.6 1.6 0 0 1 1.276.295 1.705 1.705 0 0 1 .283 2.72c-.99.985-1.975 1.974-2.978 2.947a5.512 5.512 0 0 1-.909.704 1.024 1.024 0 0 1-1.137.046 3.81 3.81 0 0 1-.374-.299.95.95 0 0 0-1.252 1.427 4.119 4.119 0 0 0 .425.356 2.778 2.778 0 0 0 2.17.52 3.965 3.965 0 0 0 2.084-1.09c1.142-1.093 2.26-2.214 3.382-3.329a3.241 3.241 0 0 0 .833-1.337c.09-.29.142-.59.212-.886v-.601a6.885 6.885 0 0 0-.235-.955z" />
    <path d="M8.406 15.049c-.273.264-.532.544-.815.798a1.73 1.73 0 0 1-2.563-.29 1.699 1.699 0 0 1 .239-2.226c.925-.922 1.85-1.845 2.785-2.757a5.522 5.522 0 0 1 .824-.67 1.315 1.315 0 0 1 1.792.026.92.92 0 0 0 1.309-.074.942.942 0 0 0-.039-1.326 2.878 2.878 0 0 0-2.832-.77 4.551 4.551 0 0 0-2.105 1.19c-1.057 1.016-2.092 2.055-3.133 3.088a3.379 3.379 0 0 0-.88 1.446c-.078.261-.12.533-.177.8v.6a6.88 6.88 0 0 0 .225.927 3.554 3.554 0 0 0 2.948 2.347c.054.008.107.02.16.031h.601a1.301 1.301 0 0 1 .131-.029 3.7 3.7 0 0 0 1.078-.3 6 6 0 0 0 1.942-1.647.893.893 0 0 0-.03-1.103.95.95 0 0 0-1.46-.061z" />
  </svg>
)

const RemoveLinkIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M11.18 12.414a.22.22 0 0 0-.231.052l-2.842 2.841a1.671 1.671 0 1 1-2.363-2.363l2.84-2.842a.22.22 0 0 0-.134-.376L6.467 9.53a.216.216 0 0 0-.178.064L4.34 11.54a3.655 3.655 0 0 0 5.17 5.17l1.948-1.948a.222.222 0 0 0 .063-.178l-.197-1.984a.221.221 0 0 0-.145-.186zm5.44-7.983a3.659 3.659 0 0 0-5.17 0L9.5 6.38a.222.222 0 0 0-.063.178l.197 1.984a.22.22 0 0 0 .377.135l2.84-2.842a1.671 1.671 0 1 1 2.365 2.364l-2.842 2.841a.221.221 0 0 0 .135.377l1.983.196a.222.222 0 0 0 .178-.063l1.949-1.948a3.66 3.66 0 0 0 0-5.17zM6.99 8.24L3.093 4.685a.875.875 0 1 1 1.18-1.293l3.896 3.555A.875.875 0 1 1 6.99 8.24zm9.738 9.368l-3.897-3.555a.875.875 0 1 1 1.179-1.293l3.897 3.555a.875.875 0 1 1-1.18 1.293z" />
  </svg>
)

const ListAddIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M14.296 9.735h-3.032v-3.03a.765.765 0 1 0-1.53 0v3.03h-3.03a.765.765 0 0 0 0 1.529h3.032v3.03a.764.764 0 1 0 1.529 0v-3.03h3.03a.765.765 0 0 0 0-1.529z" />
    <path d="M10.5 2.029a8.471 8.471 0 1 0 8.471 8.471A8.481 8.481 0 0 0 10.5 2.029zm0 15.28a6.81 6.81 0 1 1 6.81-6.81 6.817 6.817 0 0 1-6.81 6.811z" />
  </svg>
)

const ListAddBottomIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M18.6 5.8c-.3-.3-.8-.3-1.1-.1l-.1.1-7 7.5-7-7.5c-.2-.3-.7-.3-1-.1l-.1.1c-.3.3-.3.9.1 1.2l7.6 8.2c.3.3.8.3 1.1.1l.1-.1L18.6 7c.3-.3.3-.9 0-1.2z" />
    <path d="M14.3 5.2h-3v-3c0-.4-.3-.8-.8-.8s-.8.4-.8.8v3h-3c-.4.1-.7.4-.7.8s.3.7.7.7h3v3c0 .4.3.8.8.8.4 0 .8-.3.8-.8v-3h3c.4 0 .7-.3.7-.7 0-.4-.3-.7-.7-.8z" />
  </svg>
)

const ListAddTopIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M2.4 15.2c.3.3.8.3 1.1.1l.1-.1 7-7.5 7 7.5c.3.3.8.3 1.1.1l.1-.1c.3-.4.3-.9 0-1.2l-7.6-8.2c-.3-.3-.8-.3-1.1-.1l-.1.1L2.4 14c-.4.3-.4.9 0 1.2z" />
    <path d="M14.3 14.2h-3v-3c0-.4-.3-.8-.8-.8-.4 0-.8.3-.8.8v3h-3c-.4.1-.7.4-.7.8s.3.7.7.7h3v3c0 .4.3.8.8.8.4 0 .8-.3.8-.8v-3h3c.4 0 .8-.4.7-.8 0-.3-.3-.6-.7-.7z" />
  </svg>
)

const ListArrowDownIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M18.634 5.798a.768.768 0 0 0-1.146 0L10.5 13.346 3.511 5.798a.768.768 0 0 0-1.145 0 .925.925 0 0 0 0 1.237l7.56 8.167a.768.768 0 0 0 1.146 0l.002-.003 7.56-8.165a.925.925 0 0 0 0-1.236z" />
  </svg>
)

const ListArrowUpIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M2.366 15.202a.768.768 0 0 0 1.145 0L10.5 7.654l6.989 7.548a.768.768 0 0 0 1.145 0 .925.925 0 0 0 0-1.237l-7.561-8.167a.768.768 0 0 0-1.146 0l-.001.003-7.56 8.164a.925.925 0 0 0 0 1.237z" />
  </svg>
)

const ListArrowRightIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M5.798 2.366a.768.768 0 0 0 0 1.145l7.548 6.989-7.548 6.989a.768.768 0 0 0 0 1.145.925.925 0 0 0 1.237 0l8.167-7.56a.768.768 0 0 0 0-1.146l-.003-.002-8.164-7.56a.925.925 0 0 0-1.237 0z" />
  </svg>
)

const ListArrowLeftIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path
      transform="scale(-1,1) translate(-21, 0)"
      d="M5.798 2.366a.768.768 0 0 0 0 1.145l7.548 6.989-7.548 6.989a.768.768 0 0 0 0 1.145.925.925 0 0 0 1.237 0l8.167-7.56a.768.768 0 0 0 0-1.146l-.003-.002-8.164-7.56a.925.925 0 0 0-1.237 0z"
    />
  </svg>
)

const ListRemoveIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M14.137 11.375H6.863a.875.875 0 1 1 0-1.75h7.274a.875.875 0 1 1 0 1.75z" />
    <path d="M10.5 2.029a8.471 8.471 0 1 0 8.471 8.471A8.481 8.481 0 0 0 10.5 2.029zm0 15.28a6.81 6.81 0 1 1 6.81-6.81 6.817 6.817 0 0 1-6.81 6.811z" />
  </svg>
)

const LogoutIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M15.767 17.472H2.338V3.528h8.43a.89.89 0 0 0 .903-.875.89.89 0 0 0-.904-.875H1.492a.89.89 0 0 0-.904.875.794.794 0 0 0 .02.093.869.869 0 0 0-.02.099V18.12a.878.878 0 0 0 .023.117.792.792 0 0 0-.023.11.89.89 0 0 0 .904.875h14.275a.875.875 0 1 0 0-1.75z" />
    <path d="M20.183 9.261l-4.285-4.216a.763.763 0 0 0-1.298.551.756.756 0 0 0 .227.537l2.986 2.938H8.71a.718.718 0 1 0 0 1.436h9.179l-3.001 3.05a.763.763 0 0 0 1.088 1.07l4.216-4.285a.762.762 0 0 0-.01-1.08z" />
  </svg>
)

const NewDocumentIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M18.412 11.543a.862.862 0 1 0-1.722 0v6.429H4.31V3.028h4.293a.875.875 0 1 0 0-1.75H3.478a.882.882 0 0 0-.89.875.806.806 0 0 0 .019.093.881.881 0 0 0-.019.099V18.62a.891.891 0 0 0 .022.117.804.804 0 0 0-.022.11.882.882 0 0 0 .89.875h14.044l.015-.003.014.003a.823.823 0 0 0 .542-.217c.02-.017.044-.026.062-.044s.026-.043.042-.062a.852.852 0 0 0 .215-.552l-.003-.014.003-.015v-7.275z" />
    <path d="M17.648 5.514h-3.032v-3.03a.765.765 0 1 0-1.53 0v3.03h-3.03a.765.765 0 0 0 0 1.529h3.031v3.03a.764.764 0 1 0 1.529 0v-3.03h3.031a.765.765 0 0 0 0-1.529z" />
  </svg>
)

const PreviewIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M13.443 8.048a1.766 1.766 0 1 1-1.167-.942 3.804 3.804 0 0 0-1.776-.454 3.891 3.891 0 1 0 2.943 1.396z" />
    <path d="M10.5 2.029a8.471 8.471 0 1 0 8.471 8.471A8.481 8.481 0 0 0 10.5 2.029zm0 15.28a6.81 6.81 0 1 1 6.81-6.81 6.817 6.817 0 0 1-6.81 6.811z" />
  </svg>
)

const RemoveIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M17.865 16.584h-.001L11.78 10.5l6.084-6.084a.906.906 0 0 0-1.281-1.28l-6.084 6.083-6.083-6.083a.906.906 0 0 0-1.281 1.28l6.084 6.085-6.083 6.084a.905.905 0 1 0 1.253 1.307l.027-.027 6.084-6.083 6.084 6.083a.906.906 0 0 0 1.28-1.28z" />
  </svg>
)

const BackIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M5.7 11l3.4 3.4c.2.2.6.2.9 0 .1-.1.2-.3.2-.4 0-.2-.1-.3-.2-.4l-2.4-2.3h7.3c.3 0 .6-.3.6-.6s-.3-.6-.6-.6H7.6L10 7.5c.2-.2.2-.6 0-.9-.2-.2-.6-.2-.9 0L5.7 10c-.2.3-.2.7 0 1z" />
    <path d="M10.5 2C5.8 2 2 5.8 2 10.5S5.8 19 10.5 19s8.5-3.8 8.5-8.5S15.2 2 10.5 2zm0 15.3c-3.8 0-6.8-3.1-6.8-6.8s3.1-6.8 6.8-6.8 6.8 3.1 6.8 6.8-3 6.8-6.8 6.8z" />
  </svg>
)

const CloseIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M13.725 12.643L11.581 10.5l2.143-2.143a.765.765 0 0 0-1.082-1.081L10.5 9.418 8.357 7.275a.766.766 0 0 0-1.081 1.082L9.419 10.5l-2.143 2.143a.766.766 0 0 0 1.081 1.081l2.143-2.143 2.143 2.143a.766.766 0 0 0 1.082-1.08z" />
    <path d="M10.5 2.029c-4.67 0-8.471 3.8-8.471 8.471s3.8 8.471 8.471 8.471 8.471-3.8 8.471-8.47c0-4.672-3.8-8.472-8.471-8.472zm0 15.28c-3.755 0-6.81-3.054-6.81-6.809s3.055-6.81 6.81-6.81 6.81 3.055 6.81 6.81-3.055 6.81-6.81 6.81z" />
  </svg>
)

const SaveDocumentIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M18.412 11.543c0-.5-.386-.904-.861-.904s-.861.404-.861.904v6.429H4.31V3.028h4.293c.491 0 .89-.392.89-.875s-.399-.875-.89-.875H3.478a.882.882 0 0 0-.89.875c0 .033.016.06.02.093-.004.034-.02.064-.02.099V18.62c0 .041.018.077.023.117-.005.038-.023.071-.023.11 0 .483.398.875.89.875h14.044l.015-.003c.005 0 .009.003.014.003a.823.823 0 0 0 .542-.218c.02-.016.044-.026.062-.043.017-.018.026-.043.042-.063a.852.852 0 0 0 .215-.551c0-.005-.003-.01-.003-.014 0-.006.003-.01.003-.015v-7.275z" />
    <path d="M14.524 3.53a.758.758 0 0 0-1.098 0L9.813 7.434a.814.814 0 0 0 0 1.101.75.75 0 0 0 .548.243.753.753 0 0 0 .55-.243l3.065-3.31 3.065 3.31a.768.768 0 0 0 1.098 0 .815.815 0 0 0 0-1.101L14.525 3.53z" />
  </svg>
)

const CopyDocumentIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M18.412 11.543c0-.5-.386-.904-.861-.904s-.861.404-.861.904v6.429H4.31V3.028h4.293c.491 0 .89-.392.89-.875s-.399-.875-.89-.875H3.478a.882.882 0 0 0-.89.875c0 .033.016.06.02.093-.004.034-.02.064-.02.099V18.62c0 .041.018.077.023.117-.005.038-.023.071-.023.11 0 .483.398.875.89.875h14.044l.015-.003c.005 0 .009.003.014.003a.823.823 0 0 0 .542-.218c.02-.016.044-.026.062-.043.017-.018.026-.043.042-.063a.852.852 0 0 0 .215-.551c0-.005-.003-.01-.003-.014 0-.006.003-.01.003-.015v-7.275z" />
    <path d="M14.609 16.163H6.391c-.288 0-.52-.35-.52-.78 0-.431.232-.78.52-.78h8.218c.288 0 .52.349.52.78 0 .43-.232.78-.52.78zm0-3.017H6.391c-.288 0-.52-.349-.52-.78 0-.43.232-.78.52-.78h8.218c.288 0 .52.35.52.78 0 .431-.232.78-.52.78zm3.308-6.097l-3.614-3.904a.764.764 0 0 0-1.099.001L9.59 7.05a.815.815 0 0 0 0 1.1.768.768 0 0 0 1.1 0l3.064-3.31 3.065 3.31c.143.155.343.243.549.243s.406-.088.55-.242a.815.815 0 0 0 0-1.101zm-8.05.846h-.001z" />
  </svg>
)

const SelectDocumentIcon: StatelessComponent = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
    <path d="M18.412 11.543c0-.5-.386-.904-.861-.904s-.861.404-.861.904v6.429H4.31V3.028h4.293c.491 0 .89-.392.89-.875s-.399-.875-.89-.875H3.478a.882.882 0 0 0-.89.875c0 .033.016.06.02.093-.004.034-.02.064-.02.099V18.62c0 .041.018.077.023.117-.005.038-.023.071-.023.11 0 .483.398.875.89.875h14.044l.015-.003c.005 0 .009.003.014.003a.823.823 0 0 0 .542-.218c.02-.016.044-.026.062-.043.017-.018.026-.043.042-.063a.852.852 0 0 0 .215-.551c0-.005-.003-.01-.003-.014 0-.006.003-.01.003-.015v-7.275z" />
    <ellipse cx="13.656" cy="6.084" rx="2.993" ry="2.993" />
  </svg>
)

export enum IconName {
  Edit = 'edit',
  Exit = 'exit',
  SectionCollapse = 'sectionCollapse',
  SectionUncollapse = 'sectionUncollapse',
  EditDocument = 'editDocument',
  DeleteDocument = 'deleteDocument',
  NewDocument = 'newDocument',
  SaveDocument = 'saveDocument',
  CopyDocument = 'copyDocument',
  SelectDocument = 'selectDocument',
  Back = 'back',
  Close = 'close',
  FilterList = 'filterList',
  FilterAscending = 'filterAscending',
  FilterDescending = 'filterDescending',
  ArrowUp = 'arrowUp',
  ArrowDown = 'arrowDown',
  ListArrowLeft = 'listArrowLeft',
  ListArrowRight = 'listArrowRight',
  ListArrowUp = 'listArrowUp',
  ListArrowDown = 'listArrowDown',
  AddTop = 'addTop',
  AddBottom = 'addBottom',
  Add = 'add',
  Remove = 'remove',
  Clear = 'clear',
  InsertLink = 'insertLink',
  RemoveLink = 'removeLink',
  FormatBold = 'formatBold',
  FormatItalic = 'formatItalic',
  FormatStrikethrough = 'formatStrikethrough',
  FormatUnderline = 'formatUnderline',
  FormatUnorderedList = 'formatUnorderedList',
  FormatOrderedList = 'formatOrderedList',
  CodeView = 'codeView',
  Preview = 'preview'
}

function nodeForIconName(name: IconName): React.ReactNode {
  switch (name) {
    case IconName.Edit:
      return <EditDocumentIcon />
    case IconName.Exit:
      return <LogoutIcon />
    case IconName.SectionCollapse:
      return <ListArrowDownIcon />
    case IconName.SectionUncollapse:
      return <ListArrowRightIcon />
    case IconName.EditDocument:
      return <EditDocumentIcon />
    case IconName.DeleteDocument:
      return <DeleteDocumentIcon />
    case IconName.NewDocument:
      return <NewDocumentIcon />
    case IconName.FilterList:
      return <FilterListIcon />
    case IconName.FilterAscending:
      return <FilterAscendingIcon />
    case IconName.FilterDescending:
      return <FilterDescendingIcon />
    case IconName.ArrowUp:
      return <ArrowUpIcon />
    case IconName.ArrowDown:
      return <ArrowDownIcon />
    case IconName.ListArrowLeft:
      return <ListArrowLeftIcon />
    case IconName.ListArrowRight:
      return <ListArrowRightIcon />
    case IconName.ListArrowUp:
      return <ListArrowUpIcon />
    case IconName.ListArrowDown:
      return <ListArrowDownIcon />
    case IconName.AddTop:
      return <ListAddTopIcon />
    case IconName.AddBottom:
      return <ListAddBottomIcon />
    case IconName.Add:
      return <ListAddIcon />
    case IconName.Remove:
      return <ListRemoveIcon />
    case IconName.Clear:
      return <RemoveIcon />
    case IconName.InsertLink:
      return <InsertLinkIcon />
    case IconName.RemoveLink:
      return <RemoveLinkIcon />
    case IconName.FormatBold:
      return <FormatBoldIcon />
    case IconName.FormatItalic:
      return <FormatItalicIcon />
    case IconName.FormatStrikethrough:
      return <FormatStrikethroughIcon />
    case IconName.FormatUnderline:
      return <FormatUnderlineIcon />
    case IconName.FormatUnorderedList:
      return <FormatUnorderedListIcon />
    case IconName.FormatOrderedList:
      return <FormatUnorderedListIcon />
    case IconName.CodeView:
      return <CodeViewIcon />
    case IconName.Preview:
      return <PreviewIcon />
    case IconName.Back:
      return <BackIcon />
    case IconName.Close:
      return <CloseIcon />
    case IconName.SaveDocument:
      return <SaveDocumentIcon />
    case IconName.CopyDocument:
      return <CopyDocumentIcon />
    case IconName.SelectDocument:
      return <SelectDocumentIcon />
  }
}

export namespace Icon {
  export interface Props {
    name: IconName
  }
}

export class Icon extends React.Component<Icon.Props> {
  public render() {
    return <span className={Icon.Style}>{nodeForIconName(this.props.name)}</span>
  }
}

export namespace Icon {
  export const Style = style({
    $debugName: 'Icon',
    display: 'inline-block',
    height: '1em',

    $nest: {
      '> svg': {
        height: '100%'
      }
    }
  })
}
