FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Directory.Packages.props", "./"]
COPY ["Core.Domain/Core.Domain.csproj", "Core.Domain/"]
COPY ["Core.Application/Core.Application.csproj", "Core.Application/"]
COPY ["Infrastructure/Infrastructure.csproj", "Infrastructure/"]
COPY ["WebApi/WebApi.csproj", "WebApi/"]

RUN dotnet restore "WebApi/WebApi.csproj"

COPY ["Core.Domain/", "Core.Domain/"]
COPY ["Core.Application/", "Core.Application/"]
COPY ["Infrastructure/", "Infrastructure/"]
COPY ["WebApi/", "WebApi/"]

WORKDIR "/src/WebApi"
RUN dotnet publish "WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

USER $APP_UID
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "WebApi.dll"]
