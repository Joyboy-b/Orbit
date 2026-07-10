cmake_minimum_required(VERSION 3.20)
project(Orbit_feed_sim LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(feed_sim src/main.cpp)
