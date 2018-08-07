FROM node:10-alpine as builder

ARG HOME_DIR=/home/node/karma.run-editor/

ARG LIBVIPS_VERSION=8.6.4
ARG LIBVIPS_SOURCE_TAR="vips-${LIBVIPS_VERSION}.tar.gz"
ARG LIBVIPS_SOURCE_URL="https://github.com/jcupitt/libvips/releases/download/v${LIBVIPS_VERSION}/${LIBVIPS_SOURCE_TAR}"

# Install build tools
RUN apk add gcc g++ make --update-cache

# Install libvips dependencies
RUN apk add libjpeg-turbo-dev libexif-dev lcms2-dev fftw-dev giflib-dev glib-dev libpng-dev \
  libwebp-dev expat-dev orc-dev tiff-dev librsvg-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/

# Build libvips with SVG support
RUN mkdir ./libvips \
  && cd ./libvips \
  && wget ${LIBVIPS_SOURCE_URL} \
  && tar -xzf ${LIBVIPS_SOURCE_TAR} --strip 1 \
  && ./configure \
  --prefix=/usr \
  --enable-debug=no \
  --without-gsf \
  --disable-static \
  --mandir=/usr/share/man \
  --infodir=/usr/share/info \
  --docdir=/usr/share/doc \
  && make \
  && make install

COPY ./package.json $HOME_DIR
COPY ./yarn.lock $HOME_DIR
COPY ./.yarnclean $HOME_DIR

WORKDIR $HOME_DIR
RUN yarn install

# Copy to final image
FROM node:10-alpine
ARG HOME_DIR=/home/node/karma.run-editor/
COPY --from=builder $HOME_DIR $HOME_DIR
COPY --from=builder /usr/lib/libvips* /usr/lib/

# Install libvips dependencies
RUN apk add libjpeg-turbo libexif lcms2 fftw giflib glib libpng libwebp expat orc tiff librsvg \
  --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/

RUN chown -R node:node $HOME_DIR
WORKDIR $HOME_DIR
USER node

EXPOSE 3000
CMD yarn start
