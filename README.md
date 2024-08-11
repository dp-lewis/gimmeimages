# Gimme Images

This is a rough and ready script to pull down images for SydCSS as part of packing up the community. 

We have a lot of images stored on other sites and wanted a quick way of pulling them down so we can archive them.

There are two scripts. 

`gimmeimages` pulls images URLs from the albums and stores them in a file as a stringified JSON object. 

`fetchimages` takes a path to one of the generated files from gimmeimages and downloads each file, storing it in a `downloaded_imagees` directory. 

## Getting set up

To use this script you'll need an `.env` file with the user name and password for access to the SydCSS page. 

In that file you'll need something like this: 

```
MEETUP_USERNAME=[YOUR USERNAME]
MEETUP_PASSWORD=[YOUR PASSWORD]
```

## Install and use

Install with `npm i`

## Pulling down your first album 

The `gimmeimages` script takes an integer which reflects where your album is listed on the Photos page. E.g. 0 will pull down from the first album. 

To use
```
npm run gimmeimages 0
```

## Fetch the images from your first album 

Gimme Images will create a file e.g. `./exports/0-name-of-album.json`

To pull down the images use the following:

```
npm run fetchimages ./exports/0-name-of-album.json 
```

This will pull down all the associated images into the `downloaded_images` directory.